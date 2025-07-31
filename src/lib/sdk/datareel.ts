import type { DataReelConstructor, BaseGetAssetsRequest, PaginatedResponse, Avatar, Voice, Template, ContentVideo, Persona, Pipeline, CreateVideoRequest, GetVideoByIdRequest, CreateAvatarRequest } from "../types";
import { getAvatars, getVoices, getTemplates, getContentVideos, getPersonas, createAvatar } from "../api/assets";
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
    RegExp('[!@#$%^&*(),.?":{}[\\]|<>\\-_]'),
    'Password must contain at least one special character',
  )


export class DataReel {
  organisationId?: string;
  private apiKey?: string = 'e845465a-4d27-4892-ae73-295300cf7c3d';
  private secret: string;

  // User information
  email?: string;
  name?: string;

  constructor({secret, organisationId}: DataReelConstructor) {
    this.secret = secret
    this.organisationId = organisationId

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

    console.log("Organisation initialized:", response);
    return response
  }

  async validateUser(email: string, name: string, apiKey: string) {
    this.organisationId = this.organisationId;
    this.apiKey = apiKey;
    this.email = email;
    this.name = name;
  }

  async login(apiKey: string, email: string, name: string) {
    this.email = email;
    this.organisationId = this.organisationId;
    this.apiKey = apiKey;
    this.name = name;
  }
 

  async logout() {
    this.organisationId = undefined;
    this.apiKey = undefined;
    this.email = undefined;
    this.name = undefined;
  }


  // GET ASSETS
  async getPersonas(labels: string[] = [], emails: string[] = []): Promise<PaginatedResponse<Persona>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');

    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      filters: {
        labels,
        emails,
      }
    };

    return await getPersonas(request);
  }

  async getAvatars(labels: string[] = [], emails: string[] = []): Promise<PaginatedResponse<Avatar>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      filters: {
        labels,
        emails,
      }
    };

    return await getAvatars(request);
  }

  async getVoices(labels: string[] = [], emails: string[] = []): Promise<PaginatedResponse<Voice>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      filters: {
        labels,
        emails,
      }
    };

    return await getVoices(request);
  }

  async getContentVideos({labels = [], emails = [], clusterIds = []}: {
    labels?: string[];
    emails?: string[];
    clusterIds?: string[];
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
      filters: {
        labels,
        emails,
      }
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
    videoFile
  }: {
    settingsId: string;
    referenceId: string;
    avatarName: string;
    videoFile: File;
  }) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: CreateAvatarRequest = {
      apiKey: this.apiKey!,
      data: {
        settings_id: settingsId || 'default',
        reference_id: referenceId,
        avatar_name: avatarName,
        video: videoFile
      }
    };

    return await createAvatar(request);
  }

  async getLanguages() {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    return await getOrganisationLanguages({
      apiKey: this.apiKey!,
      filters: undefined
    });
  }

  async getPipelines({labels = [], emails = [], languages = []}: {
    labels?: string[];
    emails?: string[];
    languages?: string[];
  }): Promise<PaginatedResponse<Pipeline>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      filters: {
        labels,
        emails,
        languages
      }
    };

    return await getPipelines(request);
  }

  // VIDEO GENERATION
  private async getPipelineFormData(pipelineId: string) {
    this.validateApiKey(this.apiKey || '');

    return await fetchPipelineFormData({
      apiKey: this.apiKey!,
      pipelineId
    })
  }


  async generateVideo(data: {
    avatar: Avatar | null;
    language: string | null;
    videoType: Pipeline | null;
    contentVideos: ContentVideo['videos'];
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

    const { avatar, language, videoType, contentVideos } = data;
    if (!avatar || !language || !videoType) {
      throw new Error("Avatar, language, and video type are required to generate a video");
    }

    const pipelineId = videoType.pipeline_id;
    const pipelineFormDataResp = await this.getPipelineFormData(pipelineId) as any;
    const pipelineFormData = pipelineFormDataResp.data.body.data as any[];
    
    const body: any = []
    pipelineFormData.forEach((component: any, componentIndex) => {
      const data = Object.keys(component).reduce((acc, key: string) => {
        if (key === 'avatar') {
          acc[key] = videoType.avatar_id
        } else if (key === 'voice') {
          acc[key] = videoType.voice_id
        } else if (key === 'template') {
          acc[key] = videoType.template_id
        } else if (key === 'language') {
          acc[key] = videoType.language
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

    if (data.shareWith.emailData.to.length > 0) {
      request.email_data = {
        to: data.shareWith.emailData.to,
        subject: data.shareWith.emailData.subject 
      };
    }

    if (data.shareWith.whatsappData.contacts.length > 0) {
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

