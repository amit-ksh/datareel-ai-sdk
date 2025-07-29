import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { cx } from "class-variance-authority";
import {
  Share2,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
  Calendar,
  Hash,
  User,
  Settings,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  Code,
  ArrowLeftIcon,
} from "lucide-react";
import { useDatareel } from "../../context/datareel-context";
import { VideoPlayer } from "../../components/ui/video-player";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface VideoViewProps {
  videoId: string;
  apiKey: string;
  organisationId: string;
  onBack?: () => void;
}

const DEFAULT_LAYOUT = {
  name: "Square",
  settings_id: "default",
  id: "default",
  canvas_dimensions: {
    width: 1,
    height: 1,
  },
  video_dimensions: {
    width: 1038,
    height: 778,
  },
  center_coordinate: {
    x: 540,
    y: 540,
  },
  pip_position: {
    x: 700,
    y: 680,
  },
  pip_size: 40,
  max_quality: 1080,
  pip_radius: 100,
};

const getTimeElapsed = (startDate: Date, endDate: Date) => {
  const diff = endDate.getTime() - startDate.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

const getUTCDateTimeFormatted = () => {
  return new Date().toISOString();
};

export const VideoView: React.FC<VideoViewProps> = ({
  videoId,
  apiKey,
  organisationId,
  onBack,
}) => {
  const { datareel } = useDatareel();
  const [pipelineData, setPipelineData] = useState(null);
  const shareUrl = `https://www.datareel.ai/delivery/${videoId}`;
  const embedCode = `<iframe 
  src="https://www.datareel.ai/embed/${videoId}" 
  width="560" 
  height="315" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState({ url: false, embed: false });

  const {
    data: resultData,
    isPending: isResultPending,
    isError: isResultError,
    error: resultErrorMessage,
    refetch: refetchResult,
  } = useQuery({
    queryKey: ["video-result", videoId],
    queryFn: () => datareel.getVideo(videoId),
    enabled: !!videoId && !!datareel,
  });

  const effectiveData = useMemo(() => {
    if (resultData?.data.status !== "PROCESSING") return resultData?.data;

    return { ...resultData?.data, ...pipelineData };
  }, [resultData?.data, pipelineData]);

  const preview =
    effectiveData?.progress?.some((progress: any) => {
      const output = progress?.output || progress?.response;
      return output?.preview || false;
    }) ?? false;

  const VideoComponents = useMemo(
    () =>
      effectiveData?.progress
        ?.map((progress: any) => {
          const videoComponent: any = {
            type: progress?.component_type,
          };

          const output = progress?.output || progress?.response;

          if (!output) return null;

          const audio = output?.audio || output?.voice;
          const audioUrl = audio?.signed_url;
          const video = output?.video;
          const videoUrl = video?.signed_url;
          const templateUrl = output?.template?.signed_url;
          const avatar = output?.PiP_video;
          const avatarUrl = output?.PiP_video?.signed_url;
          const bulletPoints = output?.bullet_points;

          if (videoUrl) videoComponent.video = videoUrl;
          else videoComponent.video = audioUrl;
          if (audioUrl) videoComponent.audio = audioUrl;
          if (templateUrl) videoComponent.template = templateUrl;
          if (avatarUrl)
            videoComponent.avatar = {
              video: avatarUrl,
              position: {
                x: output.picture_in_picture_config?.x_cordinate || 0,
                y: output.picture_in_picture_config?.y_cordinate,
                radius: (output.picture_in_picture_config?.radius || 0) * 100,
              },
            };
          if (bulletPoints) videoComponent.bullet_points = bulletPoints;

          videoComponent.duration =
            audio?.duration ||
            avatar?.duration ||
            output.duration ||
            video?.duration;
          videoComponent.videoDuration =
            video?.duration || audio?.duration || output.duration;

          return videoComponent;
        })
        .filter(Boolean),
    [effectiveData?.progress]
  );

  const progressList = resultData?.data?.progress ?? [];
  const completed = progressList?.filter((d: any) =>
    d?.status ? d.status === "COMPLETED" : d.completed
  ).length;
  const totalProgress =
    progressList.length === 0 ? 0 : (100 * completed) / progressList.length;
  const isVideoCreated =
    effectiveData?.status === "COMPLETED" || totalProgress >= 100;

  let mergeStatus = "NOT_STARTED";
  if (totalProgress !== 100) mergeStatus = "NOT_STARTED";
  else if (effectiveData?.status === "COMPLETED") mergeStatus = "COMPLETED";
  else if (effectiveData?.status === "FAILED") mergeStatus = "FAILED";

  const renderSettings = effectiveData?.render_settings || DEFAULT_LAYOUT;
  const isPortrait =
    renderSettings?.canvas_dimensions?.height >
    renderSettings?.canvas_dimensions?.width;

  const wsUrl = useMemo(() => {
    if (!videoId || !apiKey || isVideoCreated || isResultPending) return null;

    return `${process.env.NEXT_PUBLIC_VIDEO_WEBSOCKET_API_BASE_URL}/api/v1/ws/${videoId}/${apiKey}`;
  }, [videoId, apiKey, isVideoCreated, isResultPending]);

  const { lastMessage, readyState } = useWebSocket(wsUrl, {
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  // WebSocket handling for real-time updates
  useEffect(() => {
    if (!lastMessage?.data || readyState !== ReadyState.OPEN) return;

    try {
      let data = {};
      try {
        data = JSON.parse(lastMessage.data);
      } catch (error) {
        return;
      }

      if (!Array.isArray((data as any)?.current_progress)) {
        (data as any).current_progress = [(data as any)?.data];
      }

      setPipelineData((prev: any) => {
        const baseData = prev || resultData?.data;

        if (!baseData) return prev;
        if ((data as any).message === "PROCESSING") {
          const updatedProgress = [
            ...baseData?.progress?.map((progress: any) => {
              let currentProgress = (data as any).current_progress.find(
                (d: any) => d.index === progress.index
              );
              if (!currentProgress) return progress;

              currentProgress.output =
                currentProgress?.output || currentProgress?.response;

              currentProgress.status =
                currentProgress.status || progress.status || "PROCESSING";
              return {
                ...progress,
                ...currentProgress,
              };
            }),
          ];

          if (
            Number.isInteger((data as any)?.data?.index) &&
            (data as any)?.data.index < updatedProgress.length
          ) {
            updatedProgress[(data as any)?.data.index].status =
              (data as any)?.data?.status || "PROCESSING";
          }

          const isCompleted = updatedProgress?.every(
            (p: any) => p.status === "COMPLETED"
          );

          if (isCompleted) {
            refetchResult();
          }

          return {
            ...baseData,
            progress: updatedProgress,
          };
        } else if (["COMPLETED", "FAILED"].includes((data as any).message)) {
          refetchResult();
          return {
            ...prev,
            status: (data as any).message,
          };
        }
      });
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, [lastMessage, resultData?.data]);

  useEffect(() => {
    if (
      readyState === ReadyState.CLOSED &&
      resultData?.data?.status === "PROCESSING"
    ) {
      refetchResult();
    }
  }, [readyState, resultData?.data.status]);

  const endDate = new Date(
    resultData?.data?.completed_at
      ? resultData?.data?.completed_at + "Z"
      : getUTCDateTimeFormatted()
  );
  const startDate = new Date(
    effectiveData?.created_at ? `${effectiveData?.created_at}Z` : Date.now()
  );
  const timeElapsed = getTimeElapsed(startDate, endDate);

  const copyToClipboard = async (text: string, type: "url" | "embed") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const LoadingState = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Creating Your Video
          </h1>
          <p className="text-gray-600">
            AI is working on your personalized medical video. This usually takes
            a few minutes.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="text-brand font-semibold">
              {Math.round(totalProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-brand to-brand/80 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 mb-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Processing Steps
          </h4>
          {progressList?.map((step: any, index: number) => {
            const isCompleted = step?.status === "COMPLETED" || step?.completed;
            const isActive = !isCompleted && index === completed;

            return (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={cx(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isCompleted && "bg-green-100",
                    isActive && "bg-brand/10",
                    !isCompleted && !isActive && "bg-gray-200"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-brand animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cx(
                      "text-sm font-medium truncate",
                      isCompleted && "text-green-700",
                      isActive && "text-brand",
                      !isCompleted && !isActive && "text-gray-500"
                    )}
                  >
                    {step?.component_type
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                      `Step ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isCompleted
                      ? "Completed"
                      : isActive
                      ? "Processing..."
                      : "Waiting"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Elapsed */}
        <div className="text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>
            Time elapsed: <span className="font-medium">{timeElapsed}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const SharePanel = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
          <Share2 className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Share Your Video
          </h3>
          <p className="text-sm text-gray-500">
            Share via link or embed on your website
          </p>
        </div>
      </div>

      {/* Share Icons */}
      <div className="flex space-x-3 mb-6">
        <button
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          onClick={() =>
            window.open(
              `mailto:?subject=Check out this video&body=${shareUrl}`,
              "_blank"
            )
          }
        >
          <Mail className="w-5 h-5 text-white" />
        </button>
        <button
          className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
              "_blank"
            )
          }
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Share URL */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 bg-gray-50 border-gray-200"
              label=""
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(shareUrl, "url")}
              leftIcon={
                copied.url ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
              className="px-4"
            >
              {copied.url ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex-1"
            leftIcon={<Code className="w-4 h-4" />}
            onClick={() => setShowEmbedCode(!showEmbedCode)}
          >
            Embed Code
          </Button>
          <Button
            variant="outline"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open(shareUrl, "_blank")}
          >
            Preview
          </Button>
        </div>

        {/* Embed Code Section */}
        {showEmbedCode && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Embed Code
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(embedCode, "embed")}
                leftIcon={
                  copied.embed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
              >
                {copied.embed ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <code className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">
                {embedCode}
              </code>
            </div>
            <p className="text-xs text-gray-500">
              Use this code to embed the video on your website or blog.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const VideoDetails = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Video Details</h3>
          <p className="text-sm text-gray-500">
            Technical information and metadata
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">Video ID</p>
            <p className="text-sm text-gray-600 font-mono break-all">
              {videoId}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">Created</p>
            <p className="text-sm text-gray-600">
              {effectiveData?.created_at
                ? new Date(effectiveData.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Processing Time
            </p>
            <p className="text-sm text-gray-600">{timeElapsed}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">Format</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">
                {renderSettings?.canvas_dimensions?.width}×
                {renderSettings?.canvas_dimensions?.height}
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                {isPortrait ? "Portrait" : "Landscape"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isResultError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Circle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Video
          </h1>
          <p className="text-gray-600 mb-6">
            {resultErrorMessage?.message ||
              "There was an error loading your video. Please try again."}
          </p>
          <Button onClick={() => refetchResult()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isResultPending) {
    return <LoadingState />;
  }

  if (!isVideoCreated) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                className="mr-4 p-2 rounded-md text-gray-700 bg-white shadow-sm hover:shadow-md transition-shadow"
                onClick={onBack}
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Generated Video
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Your personalized video is ready
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-brand-light text-brand text-sm font-medium rounded-full flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-2"></span>
                AI Generated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={cx(
            "flex flex-col gap-8",
            isVideoCreated ? "lg:flex-row" : "lg:flex-col"
          )}
        >
          {/* Video Section */}
          <div
            className={cx(
              "w-full sticky top-4",
              isVideoCreated && !isPortrait && "lg:w-2/3",
              isPortrait &&
                "mx-auto flex h-[80vh] w-full flex-col items-center lg:w-1/2"
            )}
          >
            {/* Video Player Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div
                className={cx(
                  "w-full",
                  !isPortrait && "aspect-video",
                  isPortrait && "h-[80vh] w-fit mx-auto"
                )}
              >
                {resultData?.data.data?.s3_url ? (
                  <video
                    src={resultData?.data.data?.s3_url}
                    controls
                    playsInline
                    onContextMenu={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                    controlsList="nodownload"
                    className="w-full h-full object-cover"
                    style={{
                      aspectRatio: `${
                        renderSettings?.canvas_dimensions?.width || 1
                      } / ${renderSettings?.canvas_dimensions?.height || 1}`,
                    }}
                  />
                ) : (
                  <VideoPlayer
                    videoId={videoId}
                    pipelineId={videoId}
                    sourceId={videoId}
                    name={resultData?.data.data?.name || "Video"}
                    apiKey={apiKey}
                    organisationId={organisationId}
                    thumbnail={resultData?.data.data?.s3_thumbnail_url}
                    bgThumbnail={resultData?.data.data?.template_url}
                    video={VideoComponents || []}
                    renderSettings={renderSettings}
                    className="w-full h-full"
                    preview={preview}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Share and Details */}
          <div
            className={cx(
              "w-full space-y-6",
              isVideoCreated && !isPortrait && "lg:w-1/3",
              isPortrait && "lg:w-1/2"
            )}
          >
            <SharePanel />
            <VideoDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
