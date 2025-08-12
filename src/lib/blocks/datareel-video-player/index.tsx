import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { cx } from "class-variance-authority";
import {
  Share2,
  Copy,
  Clock,
  CheckCircle,
  Loader2,
  Mail,
  MessageCircle,
  ArrowLeftIcon,
  LinkIcon,
  LockIcon,
  CircleXIcon,
} from "lucide-react";
import { useDatareel } from "../../context/datareel-context";
import { VideoPlayer } from "../../components/ui/video-player";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface DatareelVideoPlayerProps {
  videoId: string;
  apiKey: string;
  organisationId: string;
  showShare: boolean;
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

export const DatareelVideoPlayer: React.FC<DatareelVideoPlayerProps> = ({
  videoId,
  apiKey,
  organisationId,
  showShare,
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

    return `wss://video.dev.datareel.ai/api/v1/ws/${videoId}/${apiKey}`;
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
              const currentProgress = (data as any).current_progress.find(
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
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-xs sm:max-w-sm md:max-w-md w-full">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          {/* Animated Logo/Icon */}
          <div className="relative mb-3 sm:mb-4 md:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto relative">
              <div className="absolute inset-0 border-2 sm:border-3 md:border-4 border-brand-light rounded-full animate-spin"></div>
              <div
                className="absolute inset-1 sm:inset-2 border-2 sm:border-3 md:border-4 border-brand border-t-transparent rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-brand animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
              Creating Your Personalized Video
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-tight">
              AI is working on your personalized medical video. This usually
              takes a few minutes.
            </p>

            {/* Overall Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
              <div
                className="bg-gradient-to-r from-brand to-brand-light h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(totalProgress)}% complete
            </div>
          </div>
        </div>

        {/* Current Step Details */}
        <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-100 mb-4">
          {progressList?.map((step: any, index: number) => {
            const isCompleted = step?.status === "COMPLETED" || step?.completed;
            const isActive = !isCompleted && index === completed;

            if (!isActive && !isCompleted) return null;

            return (
              <div
                key={index}
                className="flex items-start gap-2 sm:gap-3 md:gap-4"
              >
                <div className="flex-shrink-0">
                  <div
                    className={cx(
                      "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center",
                      isCompleted ? "bg-green-500" : "bg-brand"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                    ) : (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white animate-spin" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">
                    {step?.component_type
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                      `Processing Step ${index + 1}`}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 sm:mb-3 leading-tight">
                    {isCompleted
                      ? "Successfully completed"
                      : "Processing component..."}
                  </p>

                  {/* Step Progress Bar for active step */}
                  {isActive && (
                    <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                      <div
                        className="bg-brand h-1 sm:h-1.5 rounded-full transition-all duration-100 ease-out animate-pulse"
                        style={{ width: "75%" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Processing Steps Summary */}
        {progressList?.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-2 sm:p-3 md:p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm">
              Processing Steps
            </h4>
            <div className="space-y-2">
              {progressList?.map((step: any, index: number) => {
                const isCompleted =
                  step?.status === "COMPLETED" || step?.completed;
                const isActive = !isCompleted && index === completed;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 sm:gap-2 text-xs"
                  >
                    <div
                      className={cx(
                        "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full flex-shrink-0",
                        isCompleted
                          ? "bg-green-500"
                          : isActive
                          ? "bg-brand animate-pulse"
                          : "bg-gray-300"
                      )}
                    ></div>
                    <span
                      className={cx(
                        "text-gray-700 truncate",
                        isCompleted
                          ? "text-green-700"
                          : isActive
                          ? "text-brand font-medium"
                          : "text-gray-500"
                      )}
                    >
                      {step?.component_type
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                        `Step ${index + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 bg-white px-2 sm:px-3 py-1 rounded-full border">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs">AI Processing Engine Active</span>
          </div>
          <div className="mt-2 sm:mt-3 text-xs text-gray-500 flex items-center justify-center space-x-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              Time elapsed: <span className="font-medium">{timeElapsed}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const SharePanel = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
      {!showShare && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <LockIcon className="w-6 h-6 text-black" />
            </div>
            <p className="text-gray-600 font-medium">Login to unlock</p>
          </div>
        </div>
      )}
      <div className="flex bg-gray-50 items-center space-x-3  p-4">
        <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
          <Share2 className="w-5 h-5 text-gray-900" />
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
      <div className="flex justify-center space-x-3 p-4">
        <button
          className="w-12 h-12 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
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
          className="w-12 h-12 cursor-pointer bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
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
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex space-x-2 items-center">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 bg-gray-50 border-gray-200"
              label=""
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(shareUrl, "url")}
            leftIcon={
              copied.url ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
          >
            {copied.url ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => copyToClipboard(embedCode, "embed")}
            leftIcon={
              copied.embed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
          >
            {copied.embed ? "Copied!" : "Copy Embed Code"}
          </Button>
        </div>

        {/* Embed Code Section */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Embed Code Preview
            </label>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
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
            <CircleXIcon className="w-8 h-8 text-red-500" />
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
              "w-full lg:sticky top-4",
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
          </div>
        </div>
      </div>
    </div>
  );
};
