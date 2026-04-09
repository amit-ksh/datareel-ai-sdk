"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cropper from "react-easy-crop";
import { SCRIPTS, VideoRecorder } from "../../components/ui/video-recorder";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Tabs } from "../../components/ui/tabs";
import { useDatareel } from "../../context";
import { by639_1 } from "iso-language-codes";

interface CreateAvatarFormProps {
  onAvatarCreated?: (avatarData: {
    avatar_name: string;
    reference_id: string;
    settings_id: string;
    video: File;
  }) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
  onCancel?: () => void;
  avatarVideoFileValid?: (file: File) => boolean;
}

export const CreateAvatarForm: React.FC<CreateAvatarFormProps> = ({
  onAvatarCreated,
  onError,
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
  const [language, setLanguage] = useState("en");
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [render, setRender] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);
  const queryClient = useQueryClient();

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const avatarSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!videoURL) {
        throw new Error("Please upload a video");
      }
      if (isCreatingAvatar) return;

      setIsCreatingAvatar(true);
      setRender(true);

      const formData = new FormData(e.target as HTMLFormElement);
      formData.set(
        "avatar_name",
        (formData.get("avatar_name") as string)?.trim() || "",
      );
      formData.set(
        "reference_id",
        (formData.get("reference_id") as string)?.trim() || "",
      );
      formData.set("settings_id", selectedAspectRatio?.settings_id || "");

      const formObject: any = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      setRender(false);

      await datareel.createAvatar({
        settingsId: formObject.settings_id,
        videoFile: videoFile!,
        avatarName: String(formObject.avatar_name || "").trim(),
        language: language,
        crop: croppedAreaPixels,
        scale: {
          width: selectedAspectRatio?.video_dimensions?.width || 1038,
          height: selectedAspectRatio?.video_dimensions?.height || 778,
        },
        removeBackground: !!formObject.remove_background,
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
      onError?.(
        new Error(errorMessage || "Failed to create avatar. Please try again."),
      );
    } finally {
      setRender(false);
      setIsCreatingAvatar(false);
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
        <div className="grid grid-cols-2 gap-4">
          {/* Avatar name */}
          <Input
            id="avatar_name"
            name="avatar_name"
            type="text"
            label="Avatar name"
            placeholder="e.g., John Demo"
            required
          />
          {/* LANGUAGE SELECTOR */}
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className={`
              w-full px-4 py-3 border border-gray-300 rounded-md outline-none transition-colors`.trim()}
            >
              {Object.entries(SCRIPTS).map(([lang]) => (
                <option key={lang} value={lang}>
                  {/* @ts-ignore */}
                  {by639_1?.[lang]?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* <div className="flex items-center space-x-2">
          <input
            id="remove_background"
            name="remove_background"
            type="checkbox"
            className="h-4 w-4 bg-white border-gray-300 rounded outline-none"
          />
          <label
            htmlFor="remove_background"
            className="text-sm font-medium text-gray-700"
          >
            Remove background
          </label>
        </div> */}

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
                        const extension = media.type.split("/")[1] || "webm";
                        const file = new File(
                          [media.blob],
                          `avatar-video.${extension}`,
                          {
                            type: `video/${extension}`,
                          },
                        );
                        setVideoFile(file);
                      }}
                      onReset={handleReset}
                      record={{
                        audio: true,
                        video: true,
                      }}
                      language={language}
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
          disabled={isCreatingAvatar}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!videoURL || isCreatingAvatar || render || !datareel?.email}
          className="min-w-[120px]"
          title={!datareel?.email ? "Set your email to enable" : undefined}
        >
          {Boolean(render || isCreatingAvatar)
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
