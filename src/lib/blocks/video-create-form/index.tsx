import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, Plus } from "lucide-react";
import { useDatareel } from "../../context/datareel-context";
import { Button } from "../../components/ui/button";
import { ImageCard } from "../../components/ui/image-card";
import { LanguageCard } from "../../components/ui/language-card";
import { ContactForm, ContactData } from "../../components/ui/contact-form";
import { ScriptInput } from "../../components/ui/script-input";
import type { Avatar, ContentVideo, Pipeline } from "../../types";
import { ItemSelector } from "../../components";
import { CreateAvatarForm } from "../create-avatar-form";

interface VideoCreateFormProps {
  onVideoGenerate: (videoId: string) => Promise<void>;
  onError: (error: any) => Promise<void>;
  onCancel: () => void;
}

export const VideoCreateForm = ({
  onVideoGenerate,
  onError,
  onCancel,
}: VideoCreateFormProps) => {
  const { datareel } = useDatareel();
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedVideoType, setSelectedVideoType] = useState<Pipeline | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    ContentVideo["videos"]
  >([]);
  const [showCustomAvatarForm, setShowCustomAvatarForm] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({
    emails: [],
    phoneNumbers: [],
    emailSubject: "",
    whatsappCaption: "",
  });
  const [scripts, setScripts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const [customScripts, setCustomScripts] = useState<string[]>([]);
  const { data: pipelineFormDataData, isLoading: pipelineFormDataLoading } =
    useQuery({
      queryKey: ["pipelines", selectedVideoType?.pipeline_id],
      queryFn: () =>
        datareel.getPipelineFormData(selectedVideoType?.pipeline_id),
      enabled: !!datareel && !!selectedVideoType?.pipeline_id,
    });
  const dynamicClusterComponents = selectedVideoType?.data?.data.filter(
    (component) =>
      component.type === "content" && component.content?.type === "dynamic"
  );

  const textComponents = selectedVideoType?.data?.data.filter(
    (component) => component.text && component.text.type === "dynamic"
  );

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ["templates", selectedVideoType?.pipeline_id],
    queryFn: () =>
      datareel.getContentVideos({
        clusterIds: selectedVideoType.data.data
          .map((component) => {
            if (
              component.type === "content" &&
              component.content?.type === "dynamic"
            ) {
              // @ts-ignore
              return component.content?.cluster_id;
            }

            return null;
          })
          .filter(Boolean),
      }),
    enabled: !!datareel && !!selectedVideoType,
  });

  const canProceed = () => {
    const hasRequiredFields =
      !!selectedAvatar &&
      !!selectedLanguage &&
      !!selectedVideoType &&
      (!!selectedTemplate || !templatesData?.length);

    const hasRequiredScripts =
      !textComponents?.length ||
      textComponents.every((_, index) => scripts[index]?.trim());

    return hasRequiredFields && hasRequiredScripts && !isGenerating;
  };

  const renderAvatarSelection = () => (
    <ItemSelector step={1} title="Choose Your Avatar">
      {avatarsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            onClick={() => setShowCustomAvatarForm(true)}
          >
            <div className="w-full aspect-square bg-brand-light rounded-lg flex items-center justify-center">
              <Plus className="w-12 h-12 text-brand" />
            </div>
          </ImageCard>
        </div>
      )}
    </ItemSelector>
  );

  const renderLanguageSelection = () => (
    <ItemSelector step={2} title="Select Language">
      {languagesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 border rounded-lg">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                setSelectedTemplate([]); // Reset template when language changes
                setScripts([]); // Reset scripts when language changes
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {pipelinesData?.data?.map((pipeline) => (
            <ImageCard
              key={pipeline.pipeline_id}
              name={pipeline.pipeline_name}
              selected={selectedVideoType?.pipeline_id === pipeline.pipeline_id}
              onClick={() => {
                setSelectedVideoType(pipeline);
                setSelectedTemplate([]); // Reset template when video type changes
                setScripts([]); // Reset scripts when video type changes
              }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        templatesData.length > 0 &&
        templatesData.map((template, index) => (
          <div key={template.data.cluster_id}>
            <div className="text-lg font-semibold mb-4">
              {selectedVideoType.data.data[index]?.name || "Video Templates"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {template?.data?.videos?.map(
                (video: ContentVideo["videos"][number]) => (
                  <ImageCard
                    key={video.video_id}
                    name={video.video_name}
                    image={video.s3_thumbnail_url}
                    selected={
                      selectedTemplate?.[index]?.video_id === video.video_id
                    }
                    onClick={() =>
                      setSelectedTemplate((prev) => {
                        const newTemplates = [...prev];
                        newTemplates[index] = video;
                        return newTemplates;
                      })
                    }
                  />
                )
              )}
            </div>
          </div>
        ))
      )}
    </ItemSelector>
  );

  const renderScriptInput = () => {
    if (!textComponents?.length) return null;

    return (
      <ItemSelector step={5} title="Enter Scripts">
        <div className="space-y-6">
          {textComponents.map((component, index) => (
            <ScriptInput
              key={component.id}
              label={`Script for ${component.name || `Component ${index + 1}`}`}
              placeholder="Enter your script here..."
              value={scripts[index] || ""}
              onChange={(e) => {
                setScripts((prev) => {
                  const newScripts = [...prev];
                  newScripts[index] = e.target.value;
                  return newScripts;
                });
              }}
              helperText="Enter the text that will be spoken in your video"
              rows={4}
            />
          ))}
        </div>
      </ItemSelector>
    );
  };

  const renderContactForm = () => (
    <div className="space-y-6">
      <ContactForm
        type="whatsapp"
        contactData={contactData}
        onContactDataChange={setContactData}
        isOptional={true}
      />
      <ContactForm
        type="email"
        contactData={contactData}
        onContactDataChange={setContactData}
        isOptional={true}
      />
    </div>
  );

  const renderCustomAvatarForm = () => (
    <div className="min-h-screen max-w-3xl mx-auto">
      {/* Sub-Header */}
      <div className="">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                className="mr-4 p-2 rounded-md text-gray-700 bg-white shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setShowCustomAvatarForm(false)}
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Create Custom Avatar
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Upload or record a video to create your personalized avatar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <CreateAvatarForm
          onAvatarCreated={(avatarData) => {
            console.log("Avatar created:", avatarData);
            setShowCustomAvatarForm(false);
          }}
          onCancel={() => setShowCustomAvatarForm(false)}
          selectedAspectRatio={{
            settings_id: "default",
            video_dimensions: {
              width: 1038,
              height: 778,
            },
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      {showCustomAvatarForm ? (
        renderCustomAvatarForm()
      ) : (
        <>
          {/* Sub-Header */}
          <div className="">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <button
                    className="mr-4 p-2 rounded-md text-gray-700 bg-white shadow-sm hover:shadow-md transition-shadow"
                    onClick={onCancel}
                  >
                    <ArrowLeftIcon className="w-6 h-6" />
                  </button>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Generated Video
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                      Create personalized medical video content with AI-powered
                      avatars
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

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex">
              <div className="flex-1 space-y-6">
                {renderAvatarSelection()}
                {renderLanguageSelection()}
                {renderVideoTypeSelection()}
                {templatesData?.length > 0 && renderTemplateSelection()}
                {renderScriptInput()}
                {renderContactForm()}

                <div className="mt-12 text-center">
                  <Button
                    size="lg"
                    className="px-12 sm:min-w-[400px] rounded-xl lg:text-lg py-4 font-semibold"
                    onClick={async () => {
                      try {
                        setIsGenerating(true);
                        const response = await datareel.generateVideo({
                          avatar: selectedAvatar,
                          language: selectedLanguage,
                          videoType: selectedVideoType,
                          contentVideos: selectedTemplate,
                          scripts: scripts.filter((script) => script?.trim()),
                          shareWith: {
                            emailData: {
                              to: contactData.emails || [],
                              subject: contactData.emailSubject || "",
                            },
                            whatsappData: {
                              contacts: contactData.phoneNumbers || [],
                              caption: contactData.whatsappCaption || "",
                            },
                          },
                        });
                        onVideoGenerate(response.data.message.results_id);
                      } catch (error) {
                        console.error("Error generating video:", error);
                        onError(error);
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={!canProceed()}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Video...</span>
                      </div>
                    ) : (
                      "Create Video"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
