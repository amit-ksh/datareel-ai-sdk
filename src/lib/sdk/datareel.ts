import type { DataReelConstructor, BaseGetAssetsRequest, PaginatedResponse, Avatar, Voice, Template, ContentVideo, Persona, Pipeline, CreateVideoRequest, GetVideoByIdRequest, CreateAvatarRequest } from "../types";
import { getAvatars, getVoices, getTemplates, getContentVideos, getPersonas, createAvatar, createVoice, updatePersona, createPersona, getOrganisationUserLabels } from "../api/assets";
import { getPipelines, createVideo, getVideoById,  getOrganisationLanguages, fetchPipelineFormData } from "../api/pipeline";
import { createOrganisation, loginUser } from "../api/auth";

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


//   org id - 7cc30ffb-f5b1-4b80-8289-85095a824680
// api_key - 7b2ab0e4-37cd-4e8e-b7be-d29efc510f17
// persona label - 'default'
// pipeline labels -
// "educational video" - 3 videos
// "report" - 3 videos
// "custom script" - 1 video

const DEFAULT_SETTINGS = {
  organisationId: '7cc30ffb-f5b1-4b80-8289-85095a824680',
  apiKey: '7b2ab0e4-37cd-4e8e-b7be-d29efc510f17',
  user_label: 'default'
} as const


export class DataReel {
  organisationId?: string = DEFAULT_SETTINGS.organisationId;
  private apiKey?: string = DEFAULT_SETTINGS.apiKey;
  private secret: string = undefined;

  // User information
  email?: string;
  name?: string;
  referenceId?: string;

  constructor(data: DataReelConstructor) {
    this.secret = data.secret;
  }

  private validateSecret(secret: string) {
    if (this.secret !== secret) {
      throw new Error("Invalid secret");
    }
  }

  private validateOrganisationId(organisationId: string) {
    if (!this.organisationId || this.organisationId !== organisationId) {
      throw new Error("Invalid organisation ID");
    }
  }

  private validateApiKey(apiKey: string) {
    if (!this.apiKey || this.apiKey !== apiKey) {
      throw new Error("Invalid API key");
    }
  }

  private validateCredentials(secret: string, organisationId: string, apiKey: string) {
    this.validateSecret(secret);
    this.validateOrganisationId(organisationId);
    this.validateApiKey(apiKey);
  }

  // USER MANAGEMENT
  async initOrganisation(email: string, password?: string) {
    this.validateSecret(this.secret);
    
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

  async validateUser(email: string, name: string, apiKey: string) {
    this.organisationId = this.organisationId;
    this.apiKey = apiKey;
    this.email = email;
    this.name = name;
  }

  async login(apiKey: string, organisationId: string, email: string, name: string) {
    this.email = email;
    this.organisationId = organisationId;
    this.apiKey = apiKey;
    this.name = name;
  }

  useDemoAccount() {
    this.organisationId = DEFAULT_SETTINGS.organisationId;
    this.apiKey = DEFAULT_SETTINGS.apiKey;
  }

  async logout() {
    this.organisationId = undefined;
    this.apiKey = undefined;
    this.email = undefined;
    this.name = undefined;
  }


  // GET ASSETS
  async getPersonas({page=1, filters}: {page?: number, filters?: BaseGetAssetsRequest['filters']}): Promise<PaginatedResponse<Persona>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');

    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      page,
      filters: {
        user_label: DEFAULT_SETTINGS.user_label
      }
    }

    return await getPersonas(request);
  }

  async getAvatars({page=1, filters}: {page?: number, filters?: BaseGetAssetsRequest['filters']}): Promise<PaginatedResponse<Avatar>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      page,
      filters
    };

    return await getAvatars(request);
  }

  async getVoices({page=1, filters}: {page?: number, filters?: BaseGetAssetsRequest['filters']}): Promise<PaginatedResponse<Voice>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
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
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');

    if (clusterIds.length === 0) {
      return []
    }

    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
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
    referenceId,
    avatarName,
    videoFile,
    audioFiles
  }: {
    settingsId: string;
    referenceId: string;
    avatarName: string;
    videoFile: File;
    audioFiles: File[]
  }) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');

    avatarName = this.name
    referenceId = this.referenceId

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
      apiKey: this.apiKey!,
      data: {
        settings_id: settingsId || 'default',
        reference_id: referenceId,
        avatar_name: avatarName,
        video: videoFile
      }
    };

    const voicePayload = {
        voice_label: avatarName.trim(),
        reference_id: referenceId,
        language: 'end',
        model: 'eleven_labs',
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
      } 

    const voiceFormData = new FormData();
    for (const key in voicePayload) {
      voiceFormData.set(key, String(voicePayload[key as keyof typeof voicePayload]))
    }
    for (const audioFile of audioFiles) {
      voiceFormData.append('audio_files', audioFile);
    }

     const [avatar, voice] = await Promise.all([await createVoice(voiceFormData, this.apiKey!),await createAvatar(request)]);

    const updatePersonaPayload = {
        persona_id: newPersonaId,
        default_avatar: avatar?.data.video_id,
        // @ts-ignore 
        default_voice: voice?.data.voice_id,
        // @ts-ignore 
        onboarded: Boolean(voice?.data.voice_id && avatar?.data.video_id),
        consent: true,
      }

    await updatePersona(updatePersonaPayload, this.apiKey!)

    return true
  }

  async getLanguages() {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    return await getOrganisationLanguages({
      apiKey: this.apiKey!,
      filters: undefined
    });
  }

  async getUserLabels() {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    return await getOrganisationUserLabels({
      apiKey: this.apiKey!,
      assetType: 'persona'
    });
  }

  async getPipelines({page=1, languages = [], filters}: {
    page?: number;
    languages?: string[];
    filters: BaseGetAssetsRequest['filters'];
  }): Promise<PaginatedResponse<Pipeline>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      page,
      filters
    };

    console.log(languages, request.filters)
    return await getPipelines(request);
  }

  // VIDEO GENERATION
  async getPipelineFormData(pipelineId: string) {
    this.validateApiKey(this.apiKey || '');

    return await fetchPipelineFormData({
      apiKey: this.apiKey!,
      pipelineId
    })
  }


  async generateVideo(data: {
    avatar: Avatar | null;
    voice: Voice | null;
    language: string | null;
    videoType: Pipeline | null;
    contentVideos: ContentVideo['videos'];
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
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');

    const { avatar, voice, language, videoType, contentVideos, scripts = [] } = data;
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
        }

        return acc;
      }, {id: componentIndex} as Record<string, string | number>);

      body.push(data);
    })

    const request: CreateVideoRequest = {
      pipelineId: videoType.pipeline_id,
      apiKey: this.apiKey!,
      name: `Video-${Date.now()}`,
      assignee: this.email || '',
      approve: videoType.lip_sync_model !== 'preview',
      lip_sync_model: videoType.lip_sync_model,
      lip_optimization: videoType.lip_optimization,
      data: body,
      
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
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: GetVideoByIdRequest = {
      apiKey: this.apiKey!,
      videoId,
      filters: {}
    };

    return await getVideoById(request);
  }

  async getVideo(videoId: string) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: GetVideoByIdRequest = {
      apiKey: this.apiKey!,
      videoId,
      filters: {}
    };

    return await getVideoById(request);
    
  }

}

