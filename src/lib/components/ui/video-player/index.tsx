"use client";

import { cx } from "class-variance-authority";
import { QUALITY_OPTIONS, useVideoPlayer } from "./use-video-player";

import { useRef, useState } from "react";
import type { RenderSetting } from "../../../types";
import {
  Play,
  Pause,
  VolumeX,
  Volume2,
  Settings,
  Minimize,
  Maximize,
} from "lucide-react";

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

export interface VideoPlayerProps {
  apiKey: string;
  video: any;
  videoId: string;
  pipelineId: string;
  organisationId: string;
  sourceId: string;
  name: string;
  thumbnail: string;
  bgThumbnail: string | null;
  renderSettings: RenderSetting;
  preview?: boolean;
  className?: string;
}

export function VideoPlayer({
  apiKey,
  video,
  videoId = "",
  pipelineId = "",
  organisationId = "",
  sourceId = "",
  name = "",
  thumbnail = "",
  bgThumbnail = null,
  renderSettings = DEFAULT_LAYOUT,
  preview = false,
  className = "",
}: VideoPlayerProps) {
  const {
    // Refs
    hiddenVideoRef,
    videoContainerRef,
    templateContainerRef,
    playerControlRef,
    audioPlayerRef,
    avatarVideoRef,
    firstFrameCanvasRef,
    avatarCanvasRef,
    lastFrameCanvasRef,
    avatarLastFrameCanvasRef,
    presentationRef,
    isLoading,
    isStartedPlaying,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    totalDuration,
    isFullscreen,
    templateUrl,
    videoDimensions,
    presentationActive,
    presentationData,
    togglePlay,
    toggleMute,
    updateVolume,
    toggleFullscreen,
    formatTime,
    startDragging,
    debouncedSeek,
    showControls,
    setShowControls,
    showQualityMenu,
    selectedQuality,
    userSelectedQuality,
    handleQualityChange,
    toggleQualityMenu,
    handleMouseEnter,
    handleMouseLeave,
    cleanup,
    ended,
    videoQualityStatsResponse,
    avatarContainerRef,
    video1Ref,
    avatarVideo1Ref,
    isDragging,
    loadingMessage,
  } = useVideoPlayer(Array.isArray(video) ? video : [video], {
    apiKey,
    videoId,
    pipelineId,
    organisationId,
    sourceId,
    name,
    renderSettings,
    preview,
  });

  const progressBarWidth =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const showPlayerControls =
    (showControls && !ended && progressBarWidth < 99.5 && currentTime > 0) ||
    (!isPlaying && !ended && currentTime > 0);
  const showControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showVolumeSliderRef = useRef(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleVideoClick = () => {
    if (showControlsTimeoutRef.current)
      clearTimeout(showControlsTimeoutRef.current);
    if (!isPlaying) {
      togglePlay();
      return;
    }

    if (showPlayerControls) {
      togglePlay();
      setShowControls(false);
    } else {
      setShowControls(true);

      showControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        if (showControlsTimeoutRef.current)
          clearTimeout(showControlsTimeoutRef.current);
      }, 2000);
    }
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    typeof window !== "undefined" &&
    // @ts-ignore
    !window.MSStream;
  const isPortrait =
    renderSettings.canvas_dimensions.width <
    renderSettings.canvas_dimensions.height;

  const canvasWidth = isPortrait
    ? renderSettings.canvas_dimensions.width *
      (renderSettings.max_quality / renderSettings.canvas_dimensions.height)
    : renderSettings.max_quality;
  const canvasHeight = isPortrait
    ? renderSettings.max_quality
    : renderSettings.canvas_dimensions.height *
      (renderSettings.max_quality / renderSettings.canvas_dimensions.width);

  const relativeVideoWidthFromCanvasInPercentage =
    (renderSettings.video_dimensions.width / canvasWidth) * 100;
  const relativeVideoHeightFromCanvasInPercentage =
    (renderSettings.video_dimensions.height / canvasHeight) * 100;
  const relativeVideoXFromCanvasInPercentage =
    (renderSettings.center_coordinate.x / canvasWidth) * 100;
  const relativeVideoYFromCanvasInPercentage =
    (renderSettings.center_coordinate.y / canvasHeight) * 100;

  const relativeVideoData = {
    width: relativeVideoWidthFromCanvasInPercentage,
    height: relativeVideoHeightFromCanvasInPercentage,
    x: relativeVideoXFromCanvasInPercentage,
    y: relativeVideoYFromCanvasInPercentage,
  };

  const videoStyle = {
    width: isPortrait ? "auto" : `${relativeVideoWidthFromCanvasInPercentage}%`,
    height: isPortrait
      ? `${relativeVideoHeightFromCanvasInPercentage}%`
      : "auto",
    aspectRatio: `${renderSettings.video_dimensions.width} / ${renderSettings.video_dimensions.height}`,
    top: `${relativeVideoData.y}%`,
    left: `${relativeVideoData.x}%`,
  };

  return (
    <>
      <div
        className={cx(
          "relative overflow-hidden rounded-md",
          {
            "h-auto w-full": isPortrait,
            "h-auto w-full max-w-[80vh]": !isPortrait,
          },
          className
        )}
        style={{
          aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
          width: isPortrait ? "auto" : "100%",
          height: isPortrait ? "100%" : "auto",
        }}
      >
        <div
          id="fullscreen-bg"
          className={cx(
            "pointer-events-auto fixed inset-0 z-[900] hidden bg-transparent",
            "inset-0 !h-screen !w-screen scale-100",
            {
              block: isFullscreen,
            }
          )}
          style={
            isIOS
              ? {
                  // iOS-specific fixes for fullscreen
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  WebkitPerspective: "1000px",
                  perspective: "1000px",
                  WebkitTransform: "translate3d(0, 0, 0)",
                  transform: "translate3d(0, 0, 0)",
                }
              : undefined
          }
          onClick={() => {
            if (isFullscreen) {
              toggleFullscreen();
            }
          }}
        />
        {/* Template container */}
        <div
          ref={videoContainerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseEnter}
          style={{
            aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
            width: isPortrait ? "auto" : "100%",
            height: isPortrait ? "100%" : "auto",
          }}
        >
          <div
            ref={templateContainerRef}
            className={`relative ${templateUrl ? "bg-transparent" : ""}`}
            style={{
              aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
              width: isPortrait ? "auto" : "100%",
              height: isPortrait ? "100%" : "auto",
            }}
          >
            {templateUrl && (
              <img
                width={canvasWidth}
                height={canvasHeight}
                fetchPriority="high"
                src={templateUrl}
                alt=""
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
                }}
              />
            )}

            <div
              className="relative px-5"
              style={{
                aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
                width: isPortrait ? "auto" : "100%",
                height: isPortrait ? "100%" : "auto",
              }}
            >
              {/* Presentation iframe with click handler */}
              {presentationActive && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-transparent"
                  style={{
                    ...videoStyle,
                    zIndex: 5,
                  }}
                >
                  <iframe
                    ref={presentationRef}
                    className="size-full border-none"
                    style={{
                      backgroundColor: "transparent",
                      width: "100%",
                      height: "100%",
                    }}
                    sandbox="allow-same-origin allow-scripts"
                    title="Presentation Content"
                  />
                  {/* Transparent overlay to handle clicks */}
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={handleVideoClick}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  />
                </div>
              )}

              {/* Video frames with click handler */}
              {
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer px-2"
                  onClick={handleVideoClick}
                  style={{
                    ...videoStyle,
                    opacity: presentationActive ? 0 : 1,
                    zIndex: 5,
                  }}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  <div className="relative size-full overflow-hidden rounded-md">
                    {/* Canvas for smooth transitions - shows first frame of next video during switches */}
                    <canvas
                      ref={firstFrameCanvasRef}
                      className="absolute inset-0 size-full object-cover"
                      style={{
                        pointerEvents: "none", // Ensures clicks pass through to parent div
                        zIndex: 1,
                        display: "none",
                      }}
                    />
                    <canvas
                      ref={lastFrameCanvasRef}
                      className="absolute inset-0 size-full object-cover"
                      style={{
                        pointerEvents: "none", // Ensures clicks pass through to parent div
                        zIndex: 1,
                        display: "none",
                      }}
                    />
                    <video
                      ref={hiddenVideoRef}
                      className="absolute inset-0 size-full object-cover transition-none"
                      playsInline
                      preload="auto"
                      crossOrigin="anonymous"
                      style={{
                        pointerEvents: "none", // Ensures clicks pass through to parent div
                        zIndex: 5,
                        display: "none",
                      }}
                    />
                    <video
                      ref={video1Ref}
                      className="absolute inset-0 size-full object-cover transition-none"
                      playsInline
                      preload="auto"
                      crossOrigin="anonymous"
                      style={{
                        pointerEvents: "none", // Ensures clicks pass through to parent div
                        zIndex: 5,
                        display: "none",
                      }}
                    />
                  </div>
                </div>
              }

              {/* Avatar video frames */}
              <div
                ref={avatarContainerRef}
                className={`absolute inset-0 z-10 mx-2 box-content select-none overflow-hidden`}
                style={{
                  opacity: 0,
                  display: "none",
                }}
              >
                {/* Canvas for smooth avatar transitions - shows first frame of next avatar */}
                <canvas
                  ref={avatarCanvasRef}
                  className="absolute inset-0 size-full object-cover"
                  style={{
                    pointerEvents: "none",
                    zIndex: 1,
                    display: "none",
                  }}
                />
                <canvas
                  ref={avatarLastFrameCanvasRef}
                  className="absolute inset-0 size-full object-cover"
                  style={{
                    pointerEvents: "none",
                    zIndex: 1,
                    display: "none",
                  }}
                />
                <video
                  ref={avatarVideoRef}
                  className="absolute inset-0 size-full object-cover transition-none"
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  style={{
                    zIndex: 5,
                    display: "none",
                  }}
                />
                <video
                  ref={avatarVideo1Ref}
                  className="absolute inset-0 size-full object-cover transition-none"
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  style={{
                    zIndex: 5,
                    display: "none",
                  }}
                />
              </div>

              {/* Controls */}
              <div
                ref={playerControlRef}
                className={cx(
                  `absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-black/80 via-black/60 to-transparent px-3 py-4 text-white opacity-0 transition-opacity duration-300 md:px-4`,
                  {
                    "opacity-100": showPlayerControls,
                  }
                )}
                style={{
                  pointerEvents: showPlayerControls ? "auto" : "none",
                }}
              >
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-white/90 md:text-sm">
                  <span>
                    {formatTime(
                      currentTime <= totalDuration || ended
                        ? currentTime
                        : totalDuration
                    )}
                  </span>
                  <span>{formatTime(totalDuration)}</span>
                </div>

                {/* Progress bar */}
                <div
                  id="progressBar"
                  className="relative mb-4 h-2 w-full cursor-pointer touch-none select-none rounded-full bg-white/30 md:mb-3 md:h-1.5"
                  onMouseDown={startDragging}
                  onTouchStart={startDragging}
                  role="slider"
                  aria-label="Video progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progressBarWidth)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      const newPosition = Math.max(
                        0,
                        (currentTime - 5) / totalDuration
                      );
                      debouncedSeek?.(newPosition, true);
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      const newPosition = Math.min(
                        1,
                        (currentTime + 5) / totalDuration
                      );
                      debouncedSeek?.(newPosition, true);
                    }
                  }}
                >
                  <div
                    className="absolute h-full rounded-full bg-white shadow-sm transition-all duration-75 ease-out"
                    style={{
                      width: `${progressBarWidth}%`,
                      maxWidth: "100%",
                    }}
                  />
                  {/* Progress thumb for better mobile interaction */}
                  <div
                    className={`absolute top-1/2 rounded-full bg-white shadow-lg transition-all duration-75 ease-out ${
                      isDragging
                        ? "h-5 w-5 md:h-4 md:w-4"
                        : "h-4 w-4 md:h-3 md:w-3"
                    }`}
                    style={{
                      left: `${Math.min(progressBarWidth, 100)}%`,
                      transform: "translateX(-50%) translateY(-50%)",
                    }}
                  />
                  {/* Hover zone for better touch interaction */}
                  <div
                    className="absolute inset-y-0 -my-2 w-full"
                    style={{ minHeight: "20px" }}
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleVideoClick}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95 md:h-8 md:w-8"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} className="ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Volume controls with dropdown slider */}
                    <div className="relative flex items-center">
                      <button
                        onClick={isIOS ? toggleMute : toggleVolumeSlider}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-95 md:h-8 md:w-8"
                        title={
                          isIOS
                            ? isMuted
                              ? "Unmute"
                              : "Mute"
                            : "Volume settings"
                        }
                      >
                        {isMuted ? (
                          <VolumeX size={18} />
                        ) : (
                          <Volume2 size={18} />
                        )}
                      </button>

                      {/* Volume slider dropdown */}
                      {showVolumeSlider && (
                        <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 transform flex-col items-center gap-2 rounded-md bg-black/20 px-px py-0.5 pb-2 shadow-xl backdrop-blur-md">
                          <button
                            onClick={toggleMute}
                            className="flex h-6 w-6 items-center justify-center text-white/80 transition-all hover:text-white"
                            title={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted ? (
                              <VolumeX size={14} />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => updateVolume(e.target.value)}
                            className="h-20 w-2.5 cursor-pointer appearance-none rounded-full"
                            style={{
                              writingMode: "vertical-lr",
                              WebkitAppearance: "slider-vertical",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quality selector dropdown */}
                    <div className="quality-menu-container relative">
                      <button
                        onClick={toggleQualityMenu}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-95 md:h-8 md:w-8"
                        aria-label="Video quality settings"
                      >
                        <Settings size={18} />
                      </button>

                      {/* Quality options menu */}
                      {showQualityMenu && (
                        <div className="absolute bottom-full right-0 mb-2 min-w-[120px] rounded-lg bg-black/95 py-2 text-sm shadow-xl backdrop-blur-md">
                          {QUALITY_OPTIONS.map((quality) => {
                            if (
                              videoQualityStatsResponse?.data &&
                              !videoQualityStatsResponse.data[quality] &&
                              quality !== "Auto"
                            )
                              return null;
                            return (
                              <button
                                key={quality}
                                onClick={() => handleQualityChange(quality)}
                                className={`block w-full px-4 py-2.5 text-left transition-colors hover:bg-white/10 ${
                                  userSelectedQuality === quality
                                    ? "bg-white/20 font-medium text-white"
                                    : "text-white/90"
                                }`}
                              >
                                {quality}
                                {userSelectedQuality === "Auto" &&
                                  userSelectedQuality === quality && (
                                    <span className="text-white/70">
                                      ({selectedQuality ?? 1080})
                                    </span>
                                  )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 active:scale-95 md:h-8 md:w-8"
                      aria-label={
                        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                      }
                    >
                      {isFullscreen ? (
                        <Minimize size={18} />
                      ) : (
                        <Maximize size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Big play button in the center when paused */}
              {!isPlaying && (!isLoading || !currentTime) && (
                <div className="absolute left-1/2 top-1/2 z-[41] -translate-x-1/2 -translate-y-1/2 transform">
                  <button
                    onClick={handleVideoClick}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 active:scale-95 md:h-14 md:w-14"
                    aria-label="Play video"
                  >
                    <Play size={28} className="ml-1 md:ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isStartedPlaying && (
          <div
            className="absolute left-0 top-1/2 z-40 flex size-full -translate-y-1/2 items-center justify-center bg-transparent"
            style={{
              aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
              width: isPortrait ? "auto" : "100%",
              height: isPortrait ? "100%" : "auto",
            }}
          >
            {bgThumbnail && (
              <img
                src={bgThumbnail}
                alt=""
                width={canvasWidth}
                height={canvasHeight}
                style={{
                  aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
                  width: isPortrait ? undefined : "100%",
                  height: isPortrait ? "100%" : undefined,
                }}
                fetchPriority="high"
              />
            )}
          </div>
        )}

        {!isStartedPlaying ? (
          <div
            className="absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-md bg-transparent"
            style={{
              ...videoStyle,
            }}
          >
            {thumbnail && (
              <img
                src={thumbnail}
                alt="Loading video..."
                width={canvasWidth}
                height={canvasHeight}
                className="object-contain"
                style={{
                  aspectRatio: `${renderSettings.video_dimensions.width} / ${renderSettings.video_dimensions.height}`,
                  width: isPortrait ? undefined : "100%",
                  height: isPortrait ? "100%" : undefined,
                }}
                fetchPriority="high"
              />
            )}
          </div>
        ) : (
          isLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="video-loader size-14 animate-spin rounded-full shadow-lg"></div>
                {loadingMessage && (
                  <div className="rounded-lg bg-black/60 px-4 py-2 text-center text-sm text-white shadow-lg backdrop-blur-sm">
                    {loadingMessage}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
