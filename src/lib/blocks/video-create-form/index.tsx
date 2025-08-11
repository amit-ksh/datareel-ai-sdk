import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useDatareel } from "../../context/datareel-context";
import { Button } from "../../components/ui/button";
import { ImageCard } from "../../components/ui/image-card";
import { LanguageCard } from "../../components/ui/language-card";
import { ContactForm, ContactData } from "../../components/ui/contact-form";
import { ScriptInput } from "../../components/ui/script-input";
import type { Avatar, ContentVideo, Pipeline, Voice } from "../../types";
import { ItemSelector } from "../../components";
import { CreateAvatarForm } from "../create-avatar-form";

interface VideoCreateFormProps {
  onVideoGenerate: (videoId: string) => Promise<void> | void;
  onError: (error: any) => Promise<void> | void;
  onCancel: () => void;
}

export const VideoCreateForm = ({
  onVideoGenerate,
  onError,
  onCancel,
}: VideoCreateFormProps) => {
  const { datareel } = useDatareel();
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
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

  // Pagination states
  const [avatarsPage, setAvatarsPage] = useState(1);
  const [voicesPage, setVoicesPage] = useState(1);
  const [pipelinesPage, setPipelinesPage] = useState(1);
  const [templatesPages, setTemplatesPages] = useState<{
    [key: string]: number;
  }>({});

  // Data fetching
  const { data: avatarsData, isLoading: avatarsLoading } = useQuery({
    queryKey: ["avatars", avatarsPage],
    queryFn: () => datareel.getAvatars({ page: avatarsPage }),
    enabled: !!datareel,
  });

  const { data: voicesData, isLoading: voicesLoading } = useQuery({
    queryKey: ["voices", voicesPage],
    queryFn: () => datareel.getVoices({ page: voicesPage }),
    enabled: !!datareel,
  });

  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: () => datareel.getLanguages(),
    enabled: !!datareel,
  });

  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
    queryKey: ["pipelines", selectedLanguage, pipelinesPage],
    queryFn: () =>
      datareel.getPipelines({
        page: pipelinesPage,
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
    queryKey: ["templates", selectedVideoType?.pipeline_id, templatesPages],
    queryFn: (): Promise<
      {
        current_page: number;
        total_pages: number;
        data: ContentVideo;
      }[]
    > => {
      if (!selectedVideoType) return Promise.resolve([]);

      const clusterIds = selectedVideoType.data.data
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
        .filter(Boolean);

      return datareel.getContentVideos({
        page: templatesPages[selectedVideoType.pipeline_id] || 1,
        clusterIds,
      });
    },
    enabled: !!datareel && !!selectedVideoType,
  });

  const canProceed = () => {
    const hasRequiredFields =
      !!selectedAvatar &&
      !!selectedVoice &&
      !!selectedLanguage &&
      !!selectedVideoType &&
      (!selectedTemplate.length ||
        selectedTemplate.every((template) => Boolean(template.video_id)));

    const hasRequiredScripts =
      !textComponents?.length ||
      textComponents.every((_, index) => Boolean(scripts[index]?.trim()));

    return hasRequiredFields && hasRequiredScripts && !isGenerating;
  };

  const handleGenerateVideo = async () => {
    try {
      setIsGenerating(true);
      const response = await datareel.generateVideo({
        avatar: selectedAvatar,
        voice: selectedVoice,
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
  };

  // Helper function to reset pagination and selections when needed
  const resetPaginationAndSelections = (level: "language" | "videoType") => {
    if (level === "language") {
      setSelectedVideoType(null);
      setSelectedTemplate([]);
      setScripts([]);
      setTemplatesPages({});
      setPipelinesPage(1); // Reset pipelines pagination when language changes
    } else if (level === "videoType") {
      setSelectedTemplate([]);
      setScripts([]);
      setTemplatesPages({});
    }
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    isLoading,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-3 mt-6 bg-gradient-to-r from-brand-light/30 to-brand-light/20 rounded-xl">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className={`p-2 transition-all duration-200 ${
            currentPage <= 1 || isLoading
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-brand/20 hover:bg-brand hover:border-brand"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-brand px-4 py-2 bg-white rounded-lg border border-brand/20 shadow-sm min-w-[120px] text-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className={`p-2 transition-all duration-200 ${
            currentPage >= totalPages || isLoading
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-brand/20 hover:bg-brand hover:border-brand"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const renderAvatarSelection = () => (
    <ItemSelector step={1} title="Choose Your Avatar">
      {avatarsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
          <PaginationControls
            currentPage={avatarsPage}
            totalPages={avatarsData?.total_pages || 1}
            onPageChange={setAvatarsPage}
            isLoading={avatarsLoading}
          />
        </>
      )}
    </ItemSelector>
  );

  const renderVoiceSelection = () => (
    <ItemSelector step={2} title="Choose Your Voice">
      {voicesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {voicesData?.data?.map((voice) => (
              <ImageCard
                key={voice._id}
                name={voice.voice_label}
                description={`${voice.type} • ${voice.model_configuration.language}`}
                selected={selectedVoice?._id === voice._id}
                onClick={() => setSelectedVoice(voice)}
              >
                <div className="w-full aspect-square bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-2xl">🎤</span>
                </div>
              </ImageCard>
            ))}
          </div>
          <PaginationControls
            currentPage={voicesPage}
            totalPages={voicesData?.total_pages || 1}
            onPageChange={setVoicesPage}
            isLoading={voicesLoading}
          />
        </>
      )}
    </ItemSelector>
  );

  const renderLanguageSelection = () => (
    <ItemSelector step={3} title="Select Language">
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
                resetPaginationAndSelections("language");
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
    <ItemSelector step={4} title="Select Video Type">
      {pipelinesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pipelinesData?.data?.map((pipeline) => (
              <ImageCard
                key={pipeline.pipeline_id}
                name={pipeline.pipeline_name}
                selected={
                  selectedVideoType?.pipeline_id === pipeline.pipeline_id
                }
                onClick={() => {
                  setSelectedVideoType(pipeline);
                  resetPaginationAndSelections("videoType");
                }}
              >
                <div className="w-full aspect-video bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">📹</span>
                </div>
              </ImageCard>
            ))}
          </div>
          <PaginationControls
            currentPage={pipelinesPage}
            totalPages={pipelinesData?.total_pages || 1}
            onPageChange={setPipelinesPage}
            isLoading={pipelinesLoading}
          />
        </>
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
    <ItemSelector step={5} title="Select Template">
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
        templatesData?.length > 0 &&
        templatesData.map((template, index) => (
          <div key={template.data.cluster_id} className="space-y-4">
            <div className="text-lg font-semibold mb-4">
              {selectedVideoType?.data?.data[index]?.name || "Video Templates"}
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
            <PaginationControls
              currentPage={template.current_page}
              totalPages={template.total_pages}
              onPageChange={(page) => {
                setTemplatesPages((prev) => ({
                  ...prev,
                  [selectedVideoType?.pipeline_id || ""]: page,
                }));
              }}
              isLoading={templatesLoading}
            />
          </div>
        ))
      )}
    </ItemSelector>
  );

  const renderScriptInput = () => {
    if (!textComponents?.length) return null;

    return (
      <ItemSelector step={6} title="Enter Scripts">
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
                {renderVoiceSelection()}
                {renderLanguageSelection()}
                {renderVideoTypeSelection()}
                {templatesData?.length > 0 && renderTemplateSelection()}
                {renderScriptInput()}
                {renderContactForm()}

                <div className="mt-12 text-center">
                  <Button
                    size="lg"
                    className={`px-12 sm:min-w-[400px] rounded-xl lg:text-lg py-4 font-semibold transition-all ${
                      !canProceed() && !isGenerating
                        ? "!bg-gray-300 !hover:bg-gray-400 !text-gray-700 cursor-not-allowed"
                        : "bg-brand hover:bg-brand-dark"
                    }`}
                    onClick={handleGenerateVideo}
                    disabled={!canProceed()}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Video...</span>
                      </div>
                    ) : !canProceed() ? (
                      <div className="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-lock"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Complete All Steps</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-sparkles"
                        >
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                          <path d="M5 3v4" />
                          <path d="M19 17v4" />
                          <path d="M3 5h4" />
                          <path d="M17 19h4" />
                        </svg>
                        <span>Create AI Video</span>
                      </div>
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
