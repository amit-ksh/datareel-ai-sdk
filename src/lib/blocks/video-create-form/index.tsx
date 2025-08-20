import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, LockIcon, XIcon } from "lucide-react";
import { Eye } from "lucide-react";
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
import { DEFAULT_LAYOUT } from "../datareel-video-player/use-video-data";
import {
  Root as Dialog,
  Content as DialogContent,
  Overlay as DialogOverlay,
  Portal as DialogPortal,
  Title as DialogTitle,
} from "@radix-ui/react-dialog";
import DatareelVideoPlayer from "../datareel-video-player";

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
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

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
    enabled: !!datareel && !!selectedUserLabel && !!selectedLanguage,
  });

  const { data: userLabelsData } = useQuery({
    queryKey: ["userLabels"],
    queryFn: () => datareel.getUserLabels(),
    enabled: !!datareel,
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
      setPipelinesPage(1); // Reset pipelines pagination when language changes
    } else if (level === "videoType") {
      setSelectedTemplate([]);
      setScripts([]);
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
                name="Create Avatar"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {userLabelsData?.data?.map((label, labelIndex) => (
          <div
            key={label}
            className={`relative group p-3 border min-w-32 min-h-16 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-center items-center overflow-hidden ${
              selectedUserLabel === label
                ? "border-brand border-2"
                : "border-gray-200 hover:border-brand bg-white"
            }`}
            onClick={() => {
              setSelectedUserLabel(label);
            }}
          >
            {!datareel.email && labelIndex > 0 ? (
              <>
                <div className="text-center mb-2 z-20 relative">
                  <div className="text-lg font-bold text-gray-700">
                    {label.charAt(0).toUpperCase() +
                      label.slice(1).toLowerCase()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center z-20 relative">
                    <LockIcon className="size-4 text-gray-500" />
                  </div>

                  <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase z-20 relative">
                    Login to unlock
                  </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/60 to-gray-100/40 rounded-2xl pointer-events-none"></div>
              </>
            ) : (
              <div className="text-center relative z-10">
                <div className="text-lg font-bold text-gray-800 tracking-wide">
                  {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
                </div>

                {selectedUserLabel !== label && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-brand/20 transition-all duration-300"></div>
                )}
              </div>
            )}

            {(datareel.email || labelIndex === 0) && (
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 rounded-2xl pointer-events-none"></div>
            )}
          </div>
        ))}

        {!userLabelsData?.data?.length && (
          <div className="w-full col-span-1 sm:col-span-2 md:col-span-3 text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <p className="font-medium text-gray-500 text-lg">
              No labels available
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Labels will appear here when added
            </p>
          </div>
        )}
      </div>
    </ItemSelector>
  );

  const renderVideoTypeSelection = () => {
    if (!selectedUserLabel || !selectedLanguage) return null; // Hide entirely until a user label is chosen
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
              {pipelinesData?.data?.map((pipeline) => {
                const renderSettings =
                  pipeline?.render_settings || DEFAULT_LAYOUT;
                return (
                  <ImageCard
                    key={pipeline.pipeline_id}
                    name={pipeline.pipeline_name}
                    selected={
                      selectedVideoType?.pipeline_id === pipeline.pipeline_id
                    }
                    onClick={() => {
                      const selectedUserLabelIndex =
                        userLabelsData?.data.indexOf(selectedUserLabel);
                      if (selectedUserLabelIndex > 0 && !datareel.email) {
                        return;
                      }
                      setSelectedVideoType(pipeline);
                      resetPaginationAndSelections("videoType");
                    }}
                    className="group"
                  >
                    <button
                      type="button"
                      className="absolute cursor-pointer inline-flex top-2 left-2 size-7 z-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 shadow border border-gray-200"
                      title="Preview"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewVideoId(pipeline.preview_id);
                      }}
                    >
                      <Eye className="size-4" />
                    </button>
                    {pipeline.preview_thumbnail_s3?.length > 0 ? (
                      <div
                        className="relative"
                        style={{
                          aspectRatio: `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`,
                        }}
                      >
                        <img
                          src={pipeline.preview_thumbnail_s3?.[1]}
                          alt={pipeline.pipeline_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div
                          className="absolute w-full  left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            aspectRatio: `${renderSettings.video_dimensions.width} / ${renderSettings.video_dimensions.height}`,
                          }}
                        >
                          <img
                            src={pipeline.preview_thumbnail_s3?.[0]}
                            alt={pipeline.pipeline_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-brand-light rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-2xl">📹</span>
                      </div>
                    )}
                  </ImageCard>
                );
              })}

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
              label={`Enter Script`}
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
          <Dialog
            open={Boolean(previewVideoId)}
            onOpenChange={(open: boolean) => {
              if (!open) setPreviewVideoId(null);
            }}
          >
            <DialogPortal>
              <DialogOverlay className="fixed z-50 inset-0 bg-black/50" />
              <DialogContent className="fixed z-50 left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-3 py-2 shadow-lg focus:outline-none">
                <div className="flex items-center justify-between mb-2">
                  <DialogTitle className="font-medium">
                    Preview Video
                  </DialogTitle>

                  <Button
                    variant="ghost"
                    onClick={() => setPreviewVideoId(null)}
                    title="Close"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
                <DatareelVideoPlayer videoId={previewVideoId} />
              </DialogContent>
            </DialogPortal>
          </Dialog>
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
