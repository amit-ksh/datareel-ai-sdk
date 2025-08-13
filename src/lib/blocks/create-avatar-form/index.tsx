"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cropper from "react-easy-crop";
import { VideoRecorder } from "../../components/ui/video-recorder";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Tabs } from "../../components/ui/tabs";
import { cropVideo, separateVideoAndAudio } from "../../api/cropper";
import { useDatareel } from "../../context";

interface CreateAvatarFormProps {
  onAvatarCreated?: (avatarData: {
    avatar_name: string;
    reference_id: string;
    settings_id: string;
    video: File;
  }) => void;
  onCancel?: () => void;
  avatarVideoFileValid?: (file: File) => boolean;
}

export const CreateAvatarForm: React.FC<CreateAvatarFormProps> = ({
  onAvatarCreated,
  onCancel,
  avatarVideoFileValid,
}) => {
  const selectedAspectRatio = {
    settings_id: "default",
    video_dimensions: {
      width: 1038,
      height: 778,
    },
  };
  const { datareel } = useDatareel();
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [render, setRender] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");

  const queryClient = useQueryClient();

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const showCroppedVideo = async () => {
    try {
      if (!croppedAreaPixels) {
        console.error("Crop area not defined");
        return;
      }

      const croppedVideoBlob = await cropVideo({
        videoFile: videoFile!,
        crop: croppedAreaPixels,
        scale: {
          width: selectedAspectRatio?.video_dimensions?.width || 1038,
          height: selectedAspectRatio?.video_dimensions?.height || 778,
        },
      });
      return croppedVideoBlob.data;
    } catch (e: any) {
      console.error(e);
      const errorMessage = e?.response?.data?.detail || e?.message;
      throw new Error(
        errorMessage || "Failed to crop the video. Please try again."
      );
    }
  };

  const avatarSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!videoURL) {
        throw new Error("Please upload a video");
      }

      setRender(true);
      const croppedVideoBlob = await showCroppedVideo();
      if (!croppedVideoBlob) {
        console.error("Cropped video blob is not available");
        setRender(false);
        return;
      }

      const file = new File(
        [croppedVideoBlob],
        `cropped-video.${videoFile?.type.split("/")[1]}`,
        {
          type: videoFile?.type,
        }
      );
      const { video: videoWithoutAudio, audio: audioWithoutVideo } =
        await separateVideoAndAudio({
          videoFile: file,
          crop: croppedAreaPixels,
          scale: {
            width: selectedAspectRatio?.video_dimensions?.width || 1038,
            height: selectedAspectRatio?.video_dimensions?.height || 778,
          },
        });

      const formData = new FormData(e.target as HTMLFormElement);
      formData.set(
        "video",
        videoWithoutAudio.data,
        `cropped-video.${videoFile?.type.split("/")[1]}`
      );
      formData.set(
        "avatar_name",
        (formData.get("avatar_name") as string)?.trim() || ""
      );
      formData.set(
        "reference_id",
        (formData.get("reference_id") as string)?.trim() || ""
      );
      formData.set("settings_id", selectedAspectRatio?.settings_id || "");

      const formObject: any = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      setRender(false);

      await datareel.createAvatar({
        settingsId: formObject.settings_id,
        videoFile: new File(
          [videoWithoutAudio.data],
          `cropped-video.${videoFile?.type.split("/")[1]}`,
          {
            type: videoFile?.type,
          }
        ),
        audioFiles: [
          new File([audioWithoutVideo.data], "audio.mp3", {
            type: "audio/mp4",
          }),
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["personas"],
      });
      // reset form
      setVideoURL(null);
      setVideoFile(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });

      onAvatarCreated?.(formObject);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.detail || error?.message;
      throw new Error(
        errorMessage || "Failed to create avatar. Please try again."
      );
    } finally {
      setRender(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatarVideoFileValid && !avatarVideoFileValid(file)) return;

      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setVideoURL(null);
    setVideoFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "upload" | "record");
  };

  return (
    <form onSubmit={avatarSubmission} className="space-y-6">
      <div className="space-y-4">
        <Tabs
          variant="default"
          activeTab={activeTab}
          onTabChange={handleTabChange}
          items={[
            {
              id: "upload",
              label: "📁 Upload File",
              content: (
                <label htmlFor="video" className="space-y-4 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <label
                      htmlFor="video"
                      className="block font-medium text-gray-700 mb-2"
                    >
                      Upload Video File
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      id="video"
                      name="video"
                      type="file"
                      className="mt-2 sr-only"
                      accept=".mp4,.mov"
                      onChange={handleVideoFileChange}
                      label=""
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      MP4 or MOV files only. Long files may take time to upload.
                    </p>
                  </div>
                </label>
              ),
            },
            {
              id: "record",
              label: "🎥 Record Yourself",
              content: (
                <div className="space-y-4">
                  <div className="p-4">
                    <VideoRecorder
                      onRecordingComplete={async (media) => {
                        setVideoURL(media.url);
                        const file = new File(
                          [media.blob],
                          "avatar-video.webm",
                          {
                            type: "video/webm",
                          }
                        );
                        setVideoFile(file);
                      }}
                      onReset={handleReset}
                      record={{
                        audio: true,
                        video: true,
                      }}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Video Preview and Cropper */}
      {videoURL && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "300px",
              marginTop: "20px",
            }}
          >
            <Cropper
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  margin: "12px auto",
                  background: "#fff",
                },
                //   @ts-ignore
                videoStyle: {
                  width: "100%",
                  height: "100%",
                },
              }}
              video={videoURL}
              crop={crop}
              zoom={zoom}
              aspect={
                selectedAspectRatio
                  ? selectedAspectRatio.video_dimensions.width /
                    selectedAspectRatio.video_dimensions.height
                  : 4 / 3
              }
              onCropChange={!render ? setCrop : undefined}
              onZoomChange={!render ? setZoom : undefined}
              onCropComplete={onCropComplete}
              onImageLoaded={(res: any) => {
                // console.log(res)
              }}
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            handleReset();
            onCancel?.();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!videoURL || render || !datareel?.email}
          className="min-w-[120px]"
          title={!datareel?.email ? "Set your email to enable" : undefined}
        >
          {render
            ? "Creating..."
            : !datareel?.email
            ? "Create Avatar (locked)"
            : "Create Avatar"}
        </Button>
      </div>
    </form>
  );
};

export default CreateAvatarForm;
