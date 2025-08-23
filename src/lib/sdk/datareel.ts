import type { DataReelConstructor, BaseGetAssetsRequest, PaginatedResponse, Avatar, Voice,  ContentVideo, Persona, Pipeline, CreateVideoRequest, GetVideoByIdRequest, CreateAvatarRequest, ShareVideoRequest } from "../types";
import { getAvatars, getVoices,  getContentVideos, getPersonas, createVoice, updatePersona as updatePersonaApi, createPersona, getOrganisationUserLabels, createVideoAvatar, deletePersona as apiDeletePersona, deleteAvatar as apiDeleteAvatar, deleteVoice as apiDeleteVoice } from "../api/assets";
import { getPipelines, createVideo, getVideoById,  getOrganisationLanguages, fetchPipelineFormData, shareVideo } from "../api/pipeline";
import { createOrganisation, } from "../api/auth";

import * as Yup from 'yup'

export const passwordSchema = Yup.string()
  .required('Password is a required field')
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be no more than 128 characters long')
  .matches(/[a-z]/, 'Password must contain at least one small letter')
  .matches(/[A-Z]/, 'Password must contain at least one capital letter')
  .matches(/\d+/, 'Password must contain at least one number')
  .matches(
    /[!@#$%^&*(),.?":{}[\]|<>\-_]/,
    'Password must contain at least one special character',
  )

export class DataReel {
  organisationId?: string = '';
  apiKey?: string = '';
  defaultApiKey = '';
  defaultUserLabel: string = '';
  userLabels: string[] = []

  // User information
  email?: string = '';
  name?: string = '';

  constructor(data: DataReelConstructor) {
    this.organisationId = data.organisationId;
    this.apiKey = data.apiKey;
    this.defaultApiKey = data.apiKey || '';
    this.defaultUserLabel = data.defaultLabel || 'default';
    this.userLabels = data.userLabels || [];
  }


  private validateOrganisationId(organisationId: string) {
    if (!this.organisationId || this.organisationId !== organisationId) {
      throw new Error("Invalid organisation ID");
    }
  }

  private validateApiKey(apiKey: string) {
    const _apiKey = this.getApiKey();
    if (!_apiKey || _apiKey !== apiKey) {
      throw new Error("Invalid API key");
    }
  }

  private validateCredentials(organisationId: string, apiKey: string) {
    this.validateOrganisationId(organisationId);
    this.validateApiKey(apiKey);
  }

  // USER MANAGEMENT
  async initOrganisation(email: string, password?: string) {
    
    try {
      passwordSchema.validateSync(password || '')
    } catch (error) {
      console.error("Password validation failed:", error);
      throw new Error("Invalid password");
      return
    }

  const response = await createOrganisation({ email, password: password || `T7#kP2qL`, source_org_id: this.organisationId || '', tenant_name: 'Admin', project_name: 'Video Project' });
  this.organisationId = response.organisation_id;
  this.apiKey = response.api_key;

    return response
  }

  getUser() {
    return {
      email: this.email,
      name: this.name,
      organisationId: this.organisationId,
      apiKey: this.getApiKey()
    };
  }

  login({apiKey, email, name}: {
    apiKey: string;
    email: string;
    name: string;
  }) {
    this.apiKey = apiKey;
    this.email = email;
    this.name = name;
  }

  logout() {
    this.email = undefined;
    this.name = undefined;
  }


  // GET ASSETS
  async getPersonas({page=1, filters}: {page?: number, filters?: BaseGetAssetsRequest['filters']}): Promise<PaginatedResponse<Persona>> {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');

    // Always fetch personas for the default user_label and, if available, also for the user's email label.
    const baseFilters = filters || {};

    const defaultLabelRequest: BaseGetAssetsRequest = {
      apiKey: this.getApiKey()!,
      page,
      filters: {
        ...(baseFilters?.languages ? { languages: baseFilters.languages } : {}),
        user_label: this.defaultUserLabel,
      },
    };

    const promises: Promise<PaginatedResponse<Persona>>[] = [getPersonas(defaultLabelRequest)];

    if (this.email) {
      const emailLabelRequest: BaseGetAssetsRequest = {
        apiKey: this.getApiKey()!,
        page,
        filters: {
          ...(baseFilters?.languages ? { languages: baseFilters.languages } : {}),
          user_label: this.email,
        },
      };
      promises.push(getPersonas(emailLabelRequest));
    }

    const responses = await Promise.all(promises);
    const combined = responses.flatMap((r) => r.data);
    // Deduplicate by persona id
    const deduped = Array.from(new Map(combined.map((p) => [p._id, p])).values());

    return {
      data: deduped,
      total_pages: Math.max(...responses.map((r) => r.total_pages || 0)),
      current_page: page,
    };
  }

  async getAvatars({page=1, filters}: {page?: number, filters?: BaseGetAssetsRequest['filters']}): Promise<PaginatedResponse<Avatar>> {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.getApiKey()!,
      page,
      filters
    };

    return await getAvatars(request);
  }

  async getVoices({page=1, filters}: {page?: number, filters?: BaseGetAssetsRequest['filters']}): Promise<PaginatedResponse<Voice>> {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.getApiKey()!,
      page,
      filters
    };

    return await getVoices(request);
  }

  async getContentVideos({page=1, clusterIds = [], filters}: {
    page?: number;
    clusterIds?: string[];
    filters: BaseGetAssetsRequest['filters']
  }): Promise<{
    current_page: number;
    total_pages: number;
    data: ContentVideo
  }[]> {
  this.validateCredentials(this.organisationId || '', this.apiKey || '');

    if (clusterIds.length === 0) {
      return []
    }

    const request: BaseGetAssetsRequest = {
      apiKey: this.getApiKey()!,
      page,
      filters
    };

    const contentVideos = await Promise.all(clusterIds.map(async (clusterId) => {
      const response = await getContentVideos({ ...request, cluster_id: clusterId, filters: { ...request.filters } });
      return response;
    }));


    return contentVideos
  }

  async createAvatar({
    settingsId,
    videoFile,
    audioFiles,
    avatarName: providedAvatarName,
    language,
  }: {
    settingsId: string;
    videoFile: File;
    audioFiles: File[];
    avatarName?: string;
    language: string;
  }) {
  this.validateCredentials(this.organisationId || '', this.apiKey || '');

  const avatarName = (providedAvatarName || this.name || '').trim()
  const referenceId = this.email

    const personaPayload = {
  name: avatarName,
      email: this.email || '',
      reference_id: referenceId,
      organisation_id: this.organisationId || '',
      user_label: this.email
    }
    const personaFormData = new FormData()
    for (const key in personaPayload) {
      personaFormData.set(key, String(personaPayload[key as keyof typeof personaPayload]))
    }
    const newPersona = await createPersona(personaFormData, this.apiKey!)
    const newPersonaId = newPersona?.data.data

    const request: CreateAvatarRequest = {
      apiKey: this.getApiKey()!,
      data: {
        settings_id: settingsId || 'default',
        reference_id: referenceId,
        avatar_name: avatarName,
        video: videoFile,
        persona_id: newPersonaId || '',
      }
    };

  const voicePayload = {
        voice_label: avatarName.trim(),
        reference_id: referenceId,
        language: language || 'en',
        model: 'eleven_labs',
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        persona_id: newPersonaId || '',
      } 

    const voiceFormData = new FormData();
    for (const key in voicePayload) {
      voiceFormData.set(key, String(voicePayload[key as keyof typeof voicePayload]))
    }
    for (const audioFile of audioFiles) {
      voiceFormData.append('audio_files', audioFile);
    }

  const [voice, avatar] = await Promise.all([await createVoice(voiceFormData, this.getApiKey()), await createVideoAvatar(request)]);

    const updatePersonaPayload = {
        persona_id: newPersonaId,
        name: avatarName,
        default_avatar: avatar?.video_id,
        // @ts-ignore 
        default_voice: voice?.data?.voice_id,
        // @ts-ignore 
        onboarded: Boolean(voice?.data?.voice_id && avatar?.video_id),
        consent: true,
      }

  await updatePersonaApi(updatePersonaPayload, this.getApiKey())

    return true
  }

  async getLanguages() {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');

    const languages = await getOrganisationLanguages({
      apiKey: this.getApiKey(),
      filters: undefined
    });

    const englishIndex = languages.findIndex(lang => lang === 'en');
    if (englishIndex > -1) {
      const [englishLang] = languages.splice(englishIndex, 1);
      languages.unshift(englishLang);
    }

    return languages;
  }

  async getUserLabels() {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    
    return await getOrganisationUserLabels({
      apiKey: this.getApiKey()!,
      assetType: 'persona'
    });
  }

  async getPipelines({page=1, languages = [], filters}: {
    page?: number;
    languages?: string[];
    filters: BaseGetAssetsRequest['filters'];
  }): Promise<PaginatedResponse<Pipeline>> {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.getApiKey()!,
      page,
      filters
    };

    return await getPipelines(request);
  }

  // VIDEO GENERATION
  async getPipelineFormData(pipelineId: string) {
    this.validateApiKey(this.apiKey || '');

    return await fetchPipelineFormData({
      apiKey: this.getApiKey()!,
      pipelineId
    })
  }


  async generateVideo(data: {
    avatar: Avatar | null;
    voice: Voice | null;
    language: string | null;
    videoType: Pipeline | null;
    contentVideos: ContentVideo['videos'];
    presentationDataList: Array<{ bullet_points: any; dictation: string }>;
    scripts?: string[];
    shareWith?: {
      emailData: {
        to: string[];
        subject: string;
      }
      whatsappData: {
        contacts: string[];
        caption: string;
      }
    };
  }) {
  this.validateCredentials(this.organisationId || '', this.apiKey || '');

    const { avatar, voice, language, videoType, contentVideos, scripts = [], presentationDataList } = data;
    if (!avatar || !voice || !language || !videoType) {
      throw new Error("Avatar, voice, language, and video type are required to generate a video");
    }

  const pipelineId = videoType.pipeline_id;
    const pipelineFormDataResp = await this.getPipelineFormData(pipelineId) as any;
    const pipelineFormData = pipelineFormDataResp.data.body.data as any[];
    
    const body: any = []
    let scriptIndex = 0;
    pipelineFormData.forEach((component: any, componentIndex) => {
      const data = Object.keys(component).reduce((acc, key: string) => {
        if (key === 'avatar') {
          acc[key] = avatar.avatar_id
        } else if (key === 'voice') {
          acc[key] = voice._id || voice.voice_id
        } else if (key === 'template') {
          acc[key] = videoType.template_id
        } else if (key === 'language') {
          acc[key] = language
        } else if (key === 'text') {
          acc[key] = scripts[scriptIndex] || '';
          scriptIndex++;
        } else if (key === 'content') {
          acc[key] = contentVideos.pop().video_id
        } else if (key === 'presentation_content') {
          const presentationData = presentationDataList.pop();
          acc[key] = {};
          acc[key]['bullet_points'] = presentationData.bullet_points;
          acc[key]['dictation'] = presentationData.dictation;
          acc[key].content_type = pipelineFormData.at(componentIndex).presentation_content?.content_type;
        }

        return acc;
      }, {id: componentIndex} as Record<string, string | number | any>);

      body.push(data);
    })

    const request: CreateVideoRequest = {
      pipelineId: videoType.pipeline_id,
      apiKey: this.getApiKey()!,
      name: ``,
      assignee: this.email || '',
      approve: true,
      lip_sync_model: videoType.lip_sync_model,
      lip_optimization: videoType.lip_optimization,
      data: body,
      user_label: this.email
    };

    if (data.shareWith?.emailData?.to.length > 0) {
      request.email_data = {
        to: data.shareWith.emailData.to,
        subject: data.shareWith.emailData.subject 
      };
    }

    if (data.shareWith?.whatsappData?.contacts.length > 0) {
      request.whatsapp_data = {
        contacts: data.shareWith.whatsappData.contacts,
        caption: data.shareWith.whatsappData.caption 
      };
    }

    return await createVideo(request);
  }

  async getVideoStatus(videoId: string) {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    
    const request: GetVideoByIdRequest = {
      apiKey: this.getApiKey()!,
      videoId,
      filters: {}
    };

    return await getVideoById(request);
  }

  async getVideo(videoId: string) {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    
    const request: GetVideoByIdRequest = {
      apiKey: this.getApiKey()!,
      videoId,
      filters: {}
    };

    return await getVideoById(request);
    
  }

  async shareVideo({data, via}: ShareVideoRequest) {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');

    const request = {
      apiKey: this.getApiKey()!,
      ...data
    } as const;

    return await shareVideo({data: request, via} as ShareVideoRequest);
  }


  async deletePersonaAssets(persona: Persona ) {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    const apiKey = this.getApiKey()!;

    const personaId = persona._id;
    const avatarId = persona.default_avatar || null;
    const voiceId = persona.default_voice || null;

    if (!personaId) throw new Error('personaId is required');

    const errors: string[] = [];

    try {
      await apiDeletePersona({ persona_id: personaId }, apiKey);
    } catch (e: any) {
      errors.push(`persona:${e?.message || 'unknown error'}`);
    }

    if (avatarId) {
      try {
        await apiDeleteAvatar({ video_id: avatarId }, apiKey);
      } catch (e: any) {
        errors.push(`avatar:${e?.message || 'unknown error'}`);
      }
    }

    if (voiceId) {
      try {
        await apiDeleteVoice({ voice_id: voiceId }, apiKey);
      } catch (e: any) {
        errors.push(`voice:${e?.message || 'unknown error'}`);
      }
    }

    if (errors.length) {
      throw new Error(`Delete completed with issues -> ${errors.join('; ')}`);
    }
    return true;
  }


  async updatePersona({
    personaId,
    name,
  }: {
    personaId: string;
    name: string;
  }) {
    this.validateCredentials(this.organisationId || '', this.apiKey || '');
    const apiKey = this.getApiKey()!;
    const payload = {
      persona_id: personaId,
      name,
    };
    return updatePersonaApi(payload as any, apiKey);
  }


  getApiKey() {
    return this.apiKey || this.defaultApiKey;
  }
}

