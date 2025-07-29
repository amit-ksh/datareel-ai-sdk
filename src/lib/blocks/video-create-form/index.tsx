import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, Plus } from "lucide-react";
import { useDatareel } from "../../context/datareel-context";
import { Button } from "../../components/ui/button";
import { ImageCard } from "../../components/ui/image-card";
import { LanguageCard } from "../../components/ui/language-card";
import type { Avatar, ContentVideo, Pipeline } from "../../types";
import { ItemSelector } from "../../components";

interface VideoCreateFormProps {
  onVideoGenerate: (data: {
    avatar: Avatar | null;
    language: string | null;
    videoType: Pipeline | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export const VideoCreateForm = ({
  onVideoGenerate,
  onCancel,
}: VideoCreateFormProps) => {
  const { datareel } = useDatareel();
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedVideoType, setSelectedVideoType] = useState<Pipeline | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<ContentVideo | null>(
    null
  );

  // Data fetching
  const { data: avatarsData, isLoading: avatarsLoading } = useQuery({
    queryKey: ["avatars"],
    queryFn: () => datareel.getAvatars(),
    enabled: !!datareel,
  });

  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: () => datareel.getLanguages(),
    enabled: !!datareel,
  });

  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
    queryKey: ["pipelines", selectedLanguage],
    queryFn: () =>
      datareel.getPipelines({
        languages: selectedLanguage ? [selectedLanguage] : [],
      }),
    enabled: !!datareel,
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => datareel.getContentVideos(),
    enabled: !!datareel,
  });

  const canProceed = () => {
    return !!selectedAvatar && !!selectedLanguage && !!selectedVideoType;
  };

  const renderAvatarSelection = () => (
    <ItemSelector step={1} title="Choose Your Avatar">
      {avatarsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {avatarsData?.data?.map((avatar) => (
            <ImageCard
              key={avatar.avatar_id}
              name={avatar.avatar_name}
              image={avatar.s3_url_thumbnail}
              selected={selectedAvatar?.avatar_id === avatar.avatar_id}
              onClick={() => setSelectedAvatar(avatar)}
            />
          ))}
          <ImageCard
            name="Custom Avatar"
            description="Create your own"
            selected={false}
            onClick={() => {}}
          >
            <div className="w-full aspect-square bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-12 h-12 text-green-600" />
            </div>
          </ImageCard>
        </div>
      )}
    </ItemSelector>
  );

  const renderLanguageSelection = () => (
    <ItemSelector step={2} title="Select Language">
      {languagesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 border rounded-lg">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languagesData?.map((language) => (
            <LanguageCard
              key={language}
              name={language}
              description={language || "Native language"}
              flag={language.toUpperCase()}
              selected={selectedLanguage === language}
              onClick={() => {
                setSelectedLanguage(language);
                setSelectedVideoType(null); // Reset video type when language changes
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center flex items-center justify-center">
        <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-xs sm:text-sm text-gray-600 disabled:opacity-50 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-languages size-4"
            aria-hidden="true"
          >
            <path d="m5 8 6 6"></path>
            <path d="m4 14 6-6 2-3"></path>
            <path d="M2 5h12"></path>
            <path d="M7 2h1"></path>
            <path d="m22 22-5-10-5 10"></path>
            <path d="M14 18h6"></path>
          </svg>
          <span>Need a custom language?</span>
        </button>
      </div>
    </ItemSelector>
  );

  const renderVideoTypeSelection = () => (
    <ItemSelector step={3} title="Select Video Type">
      {pipelinesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pipelinesData?.data?.map((pipeline) => (
            <ImageCard
              key={pipeline.pipeline_id}
              name={pipeline.pipeline_name}
              selected={selectedVideoType?.pipeline_id === pipeline.pipeline_id}
              onClick={() => setSelectedVideoType(pipeline)}
            >
              <div className="w-full aspect-video bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-2xl">📹</span>
              </div>
            </ImageCard>
          ))}
        </div>
      )}

      <div className="text-center flex items-center justify-center">
        <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-xs sm:text-sm text-gray-600 disabled:opacity-50 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-film size-4"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M7 3v18"></path>
            <path d="M3 7.5h4"></path>
            <path d="M3 12h18"></path>
            <path d="M3 16.5h4"></path>
            <path d="M17 3v18"></path>
            <path d="M17 7.5h4"></path>
            <path d="M17 16.5h4"></path>
          </svg>
          <span>Need another video type?</span>
        </button>
      </div>
    </ItemSelector>
  );

  const renderTemplateSelection = () => (
    <ItemSelector step={4} title="Select Template">
      {templatesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templatesData?.data?.map((template) => (
            <div
              key={template.cluster_id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.cluster_id === template.cluster_id
                  ? "border-brand ring-2 ring-brand"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500 rounded-lg mb-3 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                  {template.cluster_name?.charAt(0) || "T"}
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                {template.cluster_name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {template.videos?.length
                  ? `${template.videos.length} video templates available`
                  : "Video template collection"}
              </p>
              {selectedTemplate?.cluster_id === template.cluster_id && (
                <div className="absolute bottom-2 right-2">
                  <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ItemSelector>
  );

  return (
    <div className="min-h-screen">
      {/* Sub-Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                className="mr-4 p-2 rounded-md text-gray-700 bg-white shadow-sm"
                onClick={onCancel}
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Generate Video
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Create personalized medical video content with AI-powered
                  avatars
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-500 text-sm font-medium rounded-full flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <div className="flex-1 space-y-6">
            {renderAvatarSelection()}
            {renderLanguageSelection()}
            {renderVideoTypeSelection()}

            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="px-12 sm:min-w-[400px] rounded-xl lg:text-lg py-4 font-semibold"
                onClick={() => {
                  if (onVideoGenerate) {
                    onVideoGenerate({
                      avatar: selectedAvatar,
                      language: selectedLanguage,
                      videoType: selectedVideoType,
                    });
                  }
                }}
                disabled={!canProceed()}
              >
                Create Video
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
