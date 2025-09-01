"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import useMediaRecorder from "../../../hooks/use-media-recorder";
import { trimVideoAudio } from "../../../api/cropper";
import { cx } from "class-variance-authority";
import { Button } from "../button";
// import { LiveAudioVisualizer } from "react-audio-visualize";
import { MediaErrorDisplay } from "./media-error-display";
import { createPortal } from "react-dom";
import {
  Video,
  Mic,
  SwitchCamera,
  Circle,
  RotateCcw,
  Download,
} from "lucide-react";

export const SCRIPTS: Record<string, string> = {
  en: "Welcome to our video presentation. Today, I'll be discussing the importance of digital literacy in today's rapidly evolving technological landscape. Digital literacy encompasses the skills needed to find, evaluate, utilize, share, and create content using information technologies and the internet. As our world becomes increasingly connected, these skills are becoming essential for education, employment, and civic engagement. I believe that by fostering digital literacy, we can bridge the digital divide and ensure that everyone has the opportunity to participate fully in our digital society. Thank you for watching this presentation.",
  es: "Bienvenido a nuestra presentación en video. Hoy, hablaré sobre la importancia de la alfabetización digital en el panorama tecnológico en rápida evolución de hoy. La alfabetización digital abarca las habilidades necesarias para encontrar, evaluar, utilizar, compartir y crear contenido utilizando tecnologías de la información y la internet. A medida que nuestro mundo se vuelve cada vez más conectado, estas habilidades se están convirtiendo en esenciales para la educación, el empleo y la participación cívica. Creo que al fomentar la alfabetización digital, podemos cerrar la brecha digital y garantizar que todos tengan la oportunidad de participar plenamente en nuestra sociedad digital. Gracias por ver esta presentación.",
  // hi: "हमारे वीडियो प्रस्तुति में आपका स्वागत है। आज, मैं आधुनिक तकनीकी परिदृश्य में डिजिटल साक्षरता के महत्व के बारे में बात करूंगा। डिजिटल साक्षरता में सूचना प्रौद्योगिकी और इंटरनेट का उपयोग करके सामग्री खोजने, मूल्यांकन करने, उपयोग करने, साझा करने और बनाने के लिए आवश्यक कौशल शामिल हैं। जैसे-जैसे हमारा विश्व अधिक जुड़ता जा रहा है, ये कौशल शिक्षा, रोजगार और नागरिक भागीदारी के लिए आवश्यक होते जा रहे हैं। मेरा मानना है कि डिजिटल साक्षरता को बढ़ावा देकर, हम डिजिटल विभाजन को पाट सकते हैं और यह सुनिश्चित कर सकते हैं कि हर किसी को हमारे डिजिटल समाज में पूरी तरह से भाग लेने का अवसर मिले। इस प्रस्तुति को देखने के लिए धन्यवाद।",
};
export interface VideoRecorderProps {
  recordDuration?: number;
  language: string;
  onRecordingComplete: (media: {
    blob: Blob;
    url: string;
    type: string;
  }) => Promise<void>;
  onReset?: () => void;
  record: {
    audio?: boolean;
    video?: boolean;
  };
}

export const VideoRecorder = ({
  recordDuration = 40,
  onRecordingComplete,
  onReset,
  record,
  language,
}: VideoRecorderProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(recordDuration);
  const [highlightedText, setHighlightedText] = useState<string>("");
  const [remainingText, setRemainingText] = useState<string>(SCRIPTS[language]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [recordingStage, setRecordingStage] = useState<
    "initial" | "connected" | "instructions" | "countdown" | "recording"
  >("initial");
  const recordingCanceled = useRef<boolean>(false);

  // Countdown state
  const COUNTDOWN_SECONDS = 5; // Constant for countdown duration
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scriptContainerRef = useRef<HTMLDivElement | null>(null);
  const stopRecordingBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  const [trimming, setTrimming] = useState<boolean>(false);

  const {
    mediaRecorder,
    recordingStatus,
    recordedMedia,
    videoRef,
    stream,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
    error,
    flipCamera,
    cameraConnected,
    connectCamera,
    facingMode,
    browserSupported,
  } = useMediaRecorder({
    audio: record?.audio ?? true,
    video: record?.video ?? true,
    videoConstraints: {
      frameRate: {
        exact: 30,
      },
    },
    onRecordingComplete: async (media) => {
      if (recordingCanceled.current) return;

      if (!record?.video) {
        await onRecordingComplete(media);
        return;
      }

      setTrimming(true);
      try {
        const blobFromUrl = await fetch(media.url).then((res) => res.blob());
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const file = new File(
          [blobFromUrl],
          `scripted-recording-${new Date().toISOString()}.webm`,
          { type: "video/webm" }
        );

        // Process the video/audio with trimming and cropping
        const processedMedia = await trimVideoAudio({
          videoFile: file,
          media: {
            video: record?.video ?? true,
            audio: record?.audio ?? true,
          },
          scale:
            media?.video?.width && media?.video?.height
              ? {
                  width: media.video.width,
                  height: media.video.height,
                }
              : undefined,
          trim: {
            from: 5,
            to: Math.max(recordDuration - 5, 6),
          },
        });

        // Create a new object with the processed blob and a URL for preview
        const processedMediaObj = {
          blob: processedMedia.data,
          url: URL.createObjectURL(processedMedia.data),
          type: record?.video ? "video/webm" : "audio/mp3",
        };

        await onRecordingComplete(processedMediaObj);
      } catch (error) {
        console.error("Error processing recording:", error);
        // If processing fails, pass through the original media
        await onRecordingComplete(media);
      } finally {
        setTrimming(false);
      }
    },
  });

  // Draw video to canvas
  useEffect(() => {
    if (videoRef.current && canvasRef.current && stream.current) {
      const ctx = canvasRef.current.getContext("2d");

      const drawVideoToCanvas = () => {
        if (
          videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA
        ) {
          ctx!.drawImage(
            videoRef.current!,
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
          );
        }
        animationRef.current = requestAnimationFrame(drawVideoToCanvas);
      };

      drawVideoToCanvas();

      return () => {
        cancelAnimationFrame(animationRef.current!);
      };
    }
  }, [stream, videoRef]);

  // Highlight text and update remaining text
  useEffect(() => {
    if (cameraConnected && recordingStage === "initial") {
      setRecordingStage("connected");
    }
  }, [cameraConnected, recordingStage]);

  // Reset script text when language changes and not actively recording
  useEffect(() => {
    if (recordingStage === "initial" || recordingStage === "connected") {
      setHighlightedText("");
      setRemainingText(SCRIPTS[language] ?? "");
    }
  }, [language, recordingStage]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const startTime = Date.now();
    const duration = recordDuration * 1000;
    const currentScript = SCRIPTS[language] ?? "";

    timerRef.current = setInterval(() => {
      if (recordingCanceled.current) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        return;
      }
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      const remaining = Math.max(
        recordDuration - Math.floor(elapsed / 1000),
        0
      );

      setTimeRemaining(remaining);
      // Update script highlight based on time progress
      const totalChars = currentScript.length;
      const highlightedChars = Math.floor((newProgress / 100) * totalChars);
      setHighlightedText(currentScript.substring(0, highlightedChars));
      setRemainingText(currentScript.substring(highlightedChars));

      if (newProgress >= 100 && stopRecordingBtnRef.current) {
        stopRecordingBtnRef.current.click();
      }
    }, 200);
  };

  const resetRecording = useCallback(() => {
    recordingCanceled.current = false;
    setTimeRemaining(recordDuration);
    setHighlightedText("");
    setRemainingText(SCRIPTS[language] ?? "");
    setShowPreview(false);
    setRecordingStage("initial");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Reset scroll position of script container
    if (scriptContainerRef.current) {
      scriptContainerRef.current.scrollTop = 0;
    }
    if (onReset) onReset();
  }, [recordDuration, language, onReset]);

  const handleConnectCamera = async () => {
    try {
      await connectCamera();
    } catch (error) {
      console.error("Error connecting camera:", error);
    }
  };

  const handleStartRecording = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (recordedMedia) {
      clearRecording();
    }
    recordingCanceled.current = false;
    setCountdown(COUNTDOWN_SECONDS);
    setRecordingStage("countdown");
    setHighlightedText("");
    setRemainingText(SCRIPTS[language] ?? "");
    setTimeRemaining(recordDuration);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        const newCount = prevCount! - 1;

        if (newCount <= 0) {
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;

          setRecordingStage("recording");

          try {
            startRecording();
            startTimer();
          } catch (error) {
            console.error("Error starting recording:", error);
          }

          return null;
        }

        return newCount;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    recordingCanceled.current = false;
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    stopRecording();
    setShowPreview(true);
    setRecordingStage("initial");
  };

  const handleCancelRecording = () => {
    recordingCanceled.current = true;
    // Clear timers
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCountdown(null);
    setShowPreview(false);
    setRecordingStage("initial");
    stopRecording();
    setHighlightedText("");
    setRemainingText(SCRIPTS[language] ?? "");
    setTimeRemaining(recordDuration);
  };

  const handleFlipCamera = async () => {
    try {
      await flipCamera();
    } catch (error) {
      console.error("Error flipping camera:", error);
    }
  };
  useEffect(() => {
    const cleanup = () => {
      recordingCanceled.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setShowPreview(false);
      setRecordingStage("initial");
      stopRecording();
    };

    return cleanup;
  }, []);

  // Auto scroll to keep highlighted text visible
  useEffect(() => {
    if (scriptContainerRef.current && highlightedText) {
      const container = scriptContainerRef.current;
      const highlightSpan = container.querySelector(
        ".highlighted-text"
      ) as HTMLSpanElement | null;

      if (highlightSpan) {
        const containerRect = container.getBoundingClientRect();
        const spanRect = highlightSpan.getBoundingClientRect();

        if (spanRect.bottom > containerRect.bottom - 50) {
          container.scrollTop += 30;
        }
      }
    }
  }, [highlightedText]);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  return (
    <div>
      {/* Top script panel */}
      <div
        className={cx("mb-2", {
          "h-20 opacity-0": ["recording", "countdown"].includes(recordingStage),
        })}
      >
        <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row">
          <div>
            <h3 className="text-lg font-semibold">Script Recording Session</h3>
            <p className="text-sm text-muted-foreground">
              Read the script while being recorded ({recordDuration} seconds)
            </p>
          </div>
        </div>
        <div className="mx-auto mt-2 max-h-40 max-w-[500px] overflow-y-auto scroll-smooth rounded-lg bg-slate-100 p-4 text-[1.2rem] font-medium">
          <span className="highlighted-text font-normal text-blue-600">
            {highlightedText}
          </span>
          <span>{remainingText}</span>
        </div>
      </div>

      {/* Floating script overlay while recording */}
      {isBrowser &&
        ["recording", "countdown"].includes(recordingStage) &&
        createPortal(
          <div className="fixed left-1/2 top-0 z-[100] w-full max-w-[500px] -translate-x-1/2">
            <div className="rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur-sm">
              <div
                ref={scriptContainerRef}
                className="no-scrollbar mx-auto max-h-32 overflow-y-auto scroll-smooth rounded-lg bg-slate-100 p-4 text-[1.2rem] font-medium"
              >
                <span className="highlighted-text font-normal text-blue-600">
                  {highlightedText}
                </span>
                <span>{remainingText}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
      {error && (
        <div className="mx-auto max-w-xl">
          <MediaErrorDisplay
            error={error}
            stream={stream}
            cameraConnected={cameraConnected}
            onRetry={handleConnectCamera}
            onRefresh={() => window.location.reload()}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {recordingStage !== "initial" && record.video && timeRemaining ? (
          <div className="text-center">
            <p className="text-red-500">
              Position your head inside the oval outline
            </p>
          </div>
        ) : null}
        <div
          className={cx(
            "relative mx-auto max-w-[600px] overflow-auto rounded-lg bg-slate-900",
            showPreview || !record.video ? "hidden" : ""
          )}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full opacity-100"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={1038}
            height={778}
            className={cx(
              "h-full w-full",
              recordingStage === "initial" ? "opacity-0" : "opacity-100"
            )}
          />
          {recordingStage !== "initial" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="border-2 border-dashed border-white/80 bg-transparent"
                style={{
                  width: "180px",
                  height: "220px",
                  borderRadius: "50%",
                  transform: "translateY(-30px)",
                }}
              />
              {/* Background overlay around the oval (outside the oval) */}
              <div
                className="absolute inset-0 bg-black/60"
                style={{
                  mask: `radial-gradient(ellipse 90px 110px at center calc(50% - 30px), transparent 100%, black 100%)`,
                  WebkitMask: `radial-gradient(ellipse 90px 110px at center calc(50% - 30px), transparent 100%, black 100%)`,
                }}
              />
            </div>
          )}
          {/* No camera connected message */}
          {recordingStage === "initial" && !cameraConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="mb-4 flex items-center gap-2">
                {record?.video && <Video className="h-8 w-8 text-gray-300" />}
                {record?.audio && <Mic className="h-8 w-8 text-gray-300" />}
              </div>
              <p className="mb-2 text-center text-white">
                {record?.video && record?.audio
                  ? "Connect your camera and microphone to start recording"
                  : record?.video
                  ? "Connect your camera to start recording"
                  : "Connect your microphone to start recording"}
              </p>
              <p className="mb-4 text-center text-sm text-gray-300">
                You&apos;ll be prompted to grant permissions
              </p>
              <Button type="button" onClick={handleConnectCamera}>
                {record?.video && record?.audio
                  ? "Grant Camera & Mic Access"
                  : record?.video
                  ? "Grant Camera Access"
                  : "Grant Microphone Access"}
              </Button>
            </div>
          )}
          {/* Instructions overlay */}
          {recordingStage === "connected" && (
            <div className="absolute inset-0 flex size-full flex-col items-center justify-center bg-white p-4 shadow">
              <div className="flex flex-col items-center gap-4 p-4">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                  Recording Instructions
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="list-disc">
                    Please read the script displayed above while recording.
                  </li>
                  <li className="list-disc">
                    If you finish the script before the {recordDuration} second
                    time limit, please continue speaking and repeat parts of the
                    script until the time is up.
                  </li>
                  <li className="list-disc">
                    Position yourself in the center of the frame and ensure good
                    lighting.
                  </li>
                </ul>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setRecordingStage("instructions")}
                    size="lg"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Timer overlay */}
          {["recording", "instructions"].includes(recordingStage) && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 transform rounded-full bg-black bg-opacity-75 px-6 py-2 text-2xl font-bold text-white">
              {timeRemaining}s
            </div>
          )}
          {/* Countdown overlay */}
          {recordingStage === "countdown" && countdown !== null && (
            <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-60">
              <div className="mt-4 text-xl text-white opacity-80">
                Starting in
              </div>
              <div className="text-7xl font-bold text-white">{countdown}</div>
            </div>
          )}
          {/* Recording indicator */}
          {recordingStatus === "recording" && (
            <div className="absolute right-4 top-4 flex items-center rounded-lg bg-red-500 px-2 py-1 text-white">
              <div className="mr-2 h-3 w-3 animate-pulse rounded-full bg-white"></div>
              REC
            </div>
          )}
          {/* Camera flip button */}
          {recordingStage === "instructions" && record.video && (
            <div className="absolute right-4 top-4 flex items-center">
              <Button
                type="button"
                leftIcon={<SwitchCamera className="h-4 w-4" />}
                onClick={handleFlipCamera}
                disabled={recordingStatus === "recording"}
              />
            </div>
          )}
          {/* Bottom panel with controls and visualizer */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-6 bg-transparent px-4 py-2">
            {/* This button stop the recording and save it. Called automatically when timers ends */}
            {recordingStage === "instructions" && (
              <Button
                type="button"
                onClick={handleStartRecording}
                size="sm"
                leftIcon={<Circle className="h-4 w-4" />}
              >
                Start Recording
              </Button>
            )}

            {/* Audio Visualizer */}
            {/* {record.audio &&
              recordingStatus === "recording" &&
              mediaRecorder && (
                <div className="flex justify-center rounded-full bg-white px-6 py-2">
                  <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={100}
                    height={25}
                    barColor="#3b82f6"
                    barWidth={5}
                    gap={5}
                  />
                </div>
              )} */}

            {/* Cancel button  */}
            {/* {recordingStatus === 'recording' && (
              <Button
                type='button'
                onClick={handleCancelRecording}
                size='sm'
                color='red'
                icon={RiCloseCircleFill}
                tooltip='Cancel Recording'
              >
                Cancel Recording
              </Button>
            )} */}

            {/* This button stop the recording and save it, called automatically when timer ends - hidden */}
            {recordingStatus === "recording" && (
              <div className="hidden">
                <Button
                  ref={stopRecordingBtnRef}
                  type="button"
                  onClick={handleStopRecording}
                ></Button>
              </div>
            )}
          </div>
        </div>
        {!showPreview && record.audio && !record.video && (
          <div className="relative mx-auto my-4 w-full max-w-md rounded-md bg-slate-50 p-4">
            <div className="mb-4 flex justify-between">
              <div>
                {recordingStatus === "recording" && (
                  <div className="flex items-center rounded-lg bg-red-500 px-2 py-1 text-white">
                    <div className="mr-2 h-3 w-3 animate-pulse rounded-full bg-white"></div>
                    REC
                  </div>
                )}
              </div>
              {["recording", "instructions"].includes(recordingStage) && (
                <div className="rounded-full bg-black bg-opacity-60 px-4 py-1 text-lg font-bold text-white">
                  {timeRemaining}s
                </div>
              )}
            </div>

            <div className="my-4 flex flex-col items-center justify-center">
              {recordingStage === "countdown" ? (
                <div className="flex flex-col items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Recording starts in
                  </span>
                  <div className="text-4xl font-bold text-tremor-brand">
                    {countdown}
                  </div>
                </div>
              ) : recordingStatus === "recording" && mediaRecorder ? (
                <div className="flex flex-col items-center gap-6">
                  {/* <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={350}
                    height={50}
                    barColor="#3b82f6"
                    barWidth={4}
                    gap={4}
                  /> */}

                  {/* <Button
                    type='button'
                    onClick={handleCancelRecording}
                    size='sm'
                    color='red'
                    variant='secondary'
                    className='ml-2'
                  >
                    Cancel
                  </Button> */}
                </div>
              ) : recordingStage === "instructions" ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <Button
                    type="button"
                    onClick={handleStartRecording}
                    leftIcon={<Circle className="h-4 w-4" />}
                  >
                    Start Recording
                  </Button>
                  <p className="text-xs text-gray-500">
                    Speak clearly while following the script
                  </p>
                </div>
              ) : recordingStage === "connected" ? (
                <div className="flex flex-col items-center gap-4 bg-gray-50 p-4">
                  <h2 className="text-lg font-semibold">
                    Recording Instructions
                  </h2>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="list-disc">
                      Please read the script displayed above.
                    </li>
                    <li className="list-disc">
                      If you finish early, continue speaking until the{" "}
                      {recordDuration} second timer ends.
                    </li>
                  </ul>
                  <Button
                    type="button"
                    onClick={() => setRecordingStage("instructions")}
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Button
                    type="button"
                    onClick={handleConnectCamera}
                    leftIcon={<Mic className="h-4 w-4" />}
                  >
                    Grant Microphone Access
                  </Button>
                  <p className="text-xs text-gray-500">
                    You&apos;ll be prompted for microphone permissions
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {
          /* Preview video in place of canvas */
          showPreview &&
            (trimming ? (
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-tremor-brand border-t-transparent"></div>
                <p>Processing your recording...</p>
              </div>
            ) : (
              recordedMedia && (
                <div className="relative grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      clearRecording();
                      resetRecording();
                    }}
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                  >
                    <span className="max-sm:hidden">Record Again</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => downloadRecording("scripted-recording")}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    <span className="max-sm:hidden">Download Recording</span>
                  </Button>
                </div>
              )
            ))
        }
      </div>
    </div>
  );
};

VideoRecorder.displayName = "VideoRecorder";
