// CLEAN IMPLEMENTATION - Legacy content fully removed
import React from "react";
import { cx } from "class-variance-authority";
import {
  ArrowLeftIcon,
  CheckCircle,
  Loader2,
  CircleXIcon,
  Clock,
} from "lucide-react";
import { VideoPlayer } from "../../components/ui/video-player";
import { Button } from "../../components/ui/button";
import { useVideoData } from "./use-video-data";

export interface DatareelVideoPlayerProps {
  videoId: string;
}

export const DatareelVideoPlayer: React.FC<DatareelVideoPlayerProps> = ({
  videoId,
}) => {
  const { video } = useVideoData(videoId);
  const {
    loading,
    error,
    isVideoCreated,
    progressList,
    totalProgress,
    videoUrl,
    videoComponents,
    preview,
    renderSettings,
    isPortrait,
    apiKey,
    organisationId,
    name,
    refetch,
    loadingStateHelpers,
  } = video;

  const LoadingState = () => (
    <div className="bg-white/95 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-brand-light rounded-full animate-spin" />
            <div
              className="absolute inset-2 border-4 border-brand border-t-transparent rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-brand animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Creating Your Video
            </h2>
            <p className="text-xs text-gray-600">
              AI is generating your personalized content. This takes a few
              minutes.
            </p>
          </div>
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-brand to-brand-light transition-all"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(totalProgress)}% complete
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 max-h-72 overflow-auto space-y-3">
          {progressList?.map((step: any, index: number) => {
            const isCompleted = step?.status === "COMPLETED" || step?.completed;
            const isActive =
              !isCompleted && index === loadingStateHelpers.completedSteps;
            if (!isActive && !isCompleted) return null;
            return (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={cx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white",
                    isCompleted ? "bg-green-500" : "bg-brand"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {step?.component_type
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                      `Step ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {isCompleted ? "Completed" : "Processing..."}
                  </p>
                  {isActive && (
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div className="h-1 bg-brand animate-pulse w-3/4 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Processing...</span>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CircleXIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Video
          </h1>
          <p className="text-gray-600 mb-6">
            {error?.message ||
              "There was an error loading your video. Please try again."}
          </p>
          <Button onClick={() => refetch()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !isVideoCreated) return <LoadingState />;

  return (
    <div
      className={cx("w-full")}
      style={{
        aspectRatio: `${renderSettings?.canvas_dimensions?.width || 1} / ${
          renderSettings?.canvas_dimensions?.height || 1
        }`,
      }}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          playsInline
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
          controlsList="nodownload"
          className="w-full h-full object-cover rounded-xl shadow"
          style={{
            aspectRatio: `${renderSettings?.canvas_dimensions?.width || 1} / ${
              renderSettings?.canvas_dimensions?.height || 1
            }`,
          }}
        />
      ) : (
        <VideoPlayer
          videoId={videoId}
          pipelineId={videoId}
          sourceId={videoId}
          name={name}
          apiKey={apiKey}
          organisationId={organisationId}
          video={videoComponents || []}
          renderSettings={renderSettings}
          className="w-full h-full shadow rounded-xl"
          preview={preview}
          thumbnail={undefined as any}
          bgThumbnail={undefined as any}
        />
      )}
    </div>
  );
};

export default DatareelVideoPlayer;
