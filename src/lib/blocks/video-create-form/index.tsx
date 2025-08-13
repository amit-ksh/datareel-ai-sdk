import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, LockIcon } from "lucide-react";
import { useDatareel } from "../../context/datareel-context";
import { Button } from "../../components/ui/button";
import { ImageCard } from "../../components/ui/image-card";
import { LanguageCard } from "../../components/ui/language-card";
import {
  ContactForm,
  type ContactData,
} from "../../components/ui/contact-form";
import { ScriptInput } from "../../components/ui/script-input";
import type {
  Avatar,
  ContentVideo,
  Pipeline,
  Voice,
  Persona,
} from "../../types";
import { ItemSelector } from "../../components";
import { CreateAvatarForm } from "../create-avatar-form";
import { cx } from "class-variance-authority";

interface VideoCreateFormProps {
  onVideoGenerate: (videoId: string) => Promise<void> | void;
  onError: (error: any) => Promise<void> | void;
  onCustomAvatarCreate?: () => Promise<void> | void;
}

export const VideoCreateForm = ({
  onVideoGenerate,
  onError,
  onCustomAvatarCreate,
}: VideoCreateFormProps) => {
  const { datareel } = useDatareel();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
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
  const [selectedUserLabel, setSelectedUserLabel] = useState<string | null>(
    (datareel as any)?.userLabel || null
  );

  // Pagination states
  const [personasPage, setPersonasPage] = useState(1);
  const [pipelinesPage, setPipelinesPage] = useState(1);
  const [templatesPages, setTemplatesPages] = useState<{
    [key: string]: number;
  }>({});

  // Data fetching
  const { data: personasData, isLoading: personasLoading } = useQuery({
    queryKey: ["personas", personasPage],
    queryFn: () =>
      datareel.getPersonas({
        page: personasPage,
        filters: {},
      }),
    enabled: !!datareel,
  });

  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: () => datareel.getLanguages(),
    enabled: !!datareel,
  });

  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
    queryKey: ["pipelines", selectedLanguage, pipelinesPage, selectedUserLabel],
    queryFn: () =>
      datareel.getPipelines({
        page: pipelinesPage,
        filters: {
          user_label: selectedUserLabel,
          languages: selectedLanguage ? [selectedLanguage] : [],
        },
      }),
    // Only run when we have datareel instance AND a selected user label
    enabled: !!datareel && !!selectedUserLabel,
  });

  const { data: userLabelsData } = useQuery({
    queryKey: ["userLabels"],
    queryFn: () => datareel.getUserLabels(),
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

  // Content selection moved to a new UI section; not fetched here anymore

  const canProceed = () => {
    const contentRequiredCount = dynamicClusterComponents?.length || 0;
    const hasRequiredContent =
      contentRequiredCount === 0 ||
      (selectedTemplate.length >= contentRequiredCount &&
        selectedTemplate
          .slice(0, contentRequiredCount)
          .every((t) => Boolean(t?.video_id)));

    const hasRequiredFields =
      !!selectedAvatar &&
      !!selectedVoice &&
      !!selectedLanguage &&
      !!selectedVideoType &&
      hasRequiredContent;

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

      onVideoGenerate(response?.message?.results_id);
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

  const renderPersonaSelection = () => (
    <ItemSelector step={1} title="Choose Avatar">
      {personasLoading ? (
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
            {personasData?.data?.map((persona) => (
              <ImageCard
                key={persona._id}
                name={persona.name}
                image={persona.default_avatar_thumbnail}
                // description={persona.reference_id}
                selected={selectedPersona?._id === persona._id}
                onClick={() => {
                  setSelectedPersona(persona);
                  // Use default avatar and voice from persona
                  // Create minimal objects with required ids
                  setSelectedAvatar(
                    persona.default_avatar
                      ? ({ avatar_id: persona.default_avatar } as any)
                      : null
                  );
                  setSelectedVoice(
                    persona.default_voice
                      ? ({
                          _id: persona.default_voice,
                          voice_id: persona.default_voice,
                        } as any)
                      : null
                  );
                }}
              ></ImageCard>
            ))}
            <div
              className={cx("relative overflow-hidden", {
                "pointer-events-none grayscale": !datareel.email,
              })}
            >
              <ImageCard
                name="Create Persona"
                description="Create your own"
                selected={false}
                onClick={() => {
                  if (datareel.email) {
                    onCustomAvatarCreate();
                  }
                }}
              >
                <div className="w-full aspect-square bg-brand-light rounded-lg flex items-center justify-center">
                  {!datareel.email ? (
                    <LockIcon className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Plus className="w-12 h-12 text-brand" />
                  )}
                </div>
              </ImageCard>
            </div>
          </div>
          <PaginationControls
            currentPage={personasPage}
            totalPages={personasData?.total_pages || 1}
            onPageChange={setPersonasPage}
            isLoading={personasLoading}
          />
        </>
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
              // description={language || "Native language"}
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

      {/* <div className="text-center flex items-center justify-center">
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
      </div> */}
    </ItemSelector>
  );

  const renderUserLabels = () => (
    <ItemSelector step={3} title="Select Video Type">
      <div className="flex flex-wrap gap-2">
        {userLabelsData?.data?.map((label) => (
          <Button
            key={label}
            type="button"
            variant={selectedUserLabel === label ? "default" : "outline"}
            size="lg"
            className={`rounded-full text-lg px-6 py-3 ${
              selectedUserLabel === label ? "ring-2 ring-brand" : ""
            }`}
            aria-pressed={selectedUserLabel === label}
            onClick={() => {
              setSelectedUserLabel(label);
            }}
          >
            {label}
          </Button>
        ))}
        {!userLabelsData?.data?.length && (
          <span className="text-sm text-gray-500">No labels</span>
        )}
      </div>
    </ItemSelector>
  );

  const renderVideoTypeSelection = () => {
    if (!selectedUserLabel) return null; // Hide entirely until a user label is chosen
    return (
      <ItemSelector step={4} title="Select Template">
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
                  <div className="w-full aspect-video bg-brand-light rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-2xl">📹</span>
                  </div>
                </ImageCard>
              ))}
              {!pipelinesData?.data?.length && (
                <div className="col-span-full text-center text-sm text-gray-500 p-6 border border-dashed rounded-lg">
                  No templates available for this label & language.
                </div>
              )}
            </div>
            <PaginationControls
              currentPage={pipelinesPage}
              totalPages={pipelinesData?.total_pages || 1}
              onPageChange={setPipelinesPage}
              isLoading={pipelinesLoading}
            />
          </>
        )}
      </ItemSelector>
    );
  };

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
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <CreateAvatarForm
          onAvatarCreated={(avatarData) => {
            console.log("Avatar created:", avatarData);
            setShowCustomAvatarForm(false);
          }}
          onCancel={() => setShowCustomAvatarForm(false)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      {showCustomAvatarForm ? (
        renderCustomAvatarForm()
      ) : (
        <div className="flex">
          <div className="flex-1 space-y-6">
            {renderPersonaSelection()}
            {renderLanguageSelection()}
            {renderUserLabels()}
            {renderVideoTypeSelection()}
            {/* Content selection moved to a new UI section */}
            {renderScriptInput()}

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
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
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
      )}
    </div>
  );
};
