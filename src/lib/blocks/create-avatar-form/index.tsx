"use client";

import React, { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cropper from "react-easy-crop";
import { VideoRecorder } from "../../components/ui/video-recorder";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Tabs } from "../../components/ui/tabs";
import { cropVideo } from "../../api/cropper";
import { useDatareel } from "../../context";

interface CreateAvatarFormProps {
  onAvatarCreated?: (avatarData: any) => void;
  onCancel?: () => void;
  selectedAspectRatio?: {
    settings_id: string;
    video_dimensions: {
      width: number;
      height: number;
    };
  };
  parent?: string;
  setIsDialogOpen?: (open: boolean) => void;
  setUploadView?: (view: string) => void;
  onSubmit?: (formData: {
    avatar_name: string;
    reference_id: string;
    settings_id: string;
    video: File;
  }) => Promise<void>;
  avatarVideoFileValid?: (file: File) => boolean;
}

export const CreateAvatarForm: React.FC<CreateAvatarFormProps> = ({
  onAvatarCreated,
  onCancel,
  selectedAspectRatio,
  parent,
  setIsDialogOpen,
  setUploadView,
  onSubmit,
  avatarVideoFileValid,
}) => {
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

      if (!onSubmit) {
        throw new Error("onSubmit function not provided");
      }

      setRender(true);
      const croppedVideoBlob = await showCroppedVideo();
      if (!croppedVideoBlob) {
        console.error("Cropped video blob is not available");
        setRender(false);
        return;
      }

      const formData = new FormData(e.target as HTMLFormElement);
      formData.set("video", croppedVideoBlob, "cropped-video.mp4");
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
        referenceId: formObject.reference_id,
        avatarName: formObject.avatar_name,
        videoFile: new File([croppedVideoBlob], "cropped-video.mp4", {
          type: "video/mp4",
        }),
      });

      await onSubmit(formObject);
      queryClient.invalidateQueries({
        queryKey: ["avatars"],
      });
      setIsDialogOpen?.(false);
      if (parent === "video") {
        setUploadView?.("show all");
      }
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Avatar</h2>
        <p className="text-gray-600">
          Record or upload a video to create your custom avatar
        </p>
      </div>

      <form onSubmit={avatarSubmission} className="space-y-6">
        {/* Avatar Name */}
        <div>
          <Input
            id="avatar_name"
            name="avatar_name"
            label="Avatar Name"
            type="text"
            placeholder="Enter avatar name"
            required
            className="w-full"
          />
        </div>

        {/* Reference ID */}
        <div>
          <Input
            id="reference_id"
            name="reference_id"
            label="Reference ID"
            type="text"
            placeholder="Enter reference ID"
            required
            className="w-full"
          />
        </div>

        {/* Tab Navigation and Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Method</h3>
          <Tabs
            variant="pills"
            activeTab={activeTab}
            onTabChange={handleTabChange}
            items={[
              {
                id: "upload",
                label: "📁 Upload File",
                content: (
                  <div className="space-y-4">
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
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Upload Video File
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Input
                        id="video"
                        name="video"
                        type="file"
                        className="mt-2"
                        accept=".mp4,.mov"
                        onChange={handleVideoFileChange}
                        label=""
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        MP4 or MOV files only. Long files may take time to
                        upload.
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                id: "record",
                label: "🎥 Record Yourself",
                content: (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                      <VideoRecorder
                        onRecordingComplete={async (media) => {
                          setVideoURL(media.url);
                          const file = new File(
                            [media.blob],
                            "avatar-video.mp4",
                            {
                              type: "video/mp4",
                            }
                          );
                          setVideoFile(file);
                        }}
                        onReset={handleReset}
                        record={{
                          audio: false,
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
            disabled={!videoURL || render}
            className="min-w-[120px]"
          >
            {render ? "Creating..." : "Create Avatar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAvatarForm;
