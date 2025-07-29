import type { DataReelConstructor, BaseGetAssetsRequest, PaginatedResponse, Avatar, Voice, Template, ContentVideo, Persona, Pipeline, CreateVideoRequest, GetVideoByIdRequest, CreateAvatarRequest } from "../types";
import { getAvatars, getVoices, getTemplates, getContentVideos, getPersonas, createAvatar } from "../api/assets";
import { getPipelines, createVideo, getVideoById,  getOrganisationLanguages } from "../api/pipeline";
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
  private apiKey?: string = 'e89bdfcb-dfa2-4ef3-b115-36ba0960ff44';
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

  // async login(apiKey: string, email: string, name: string) {
  //   this.email = email;
  //   this.organisationId = this.organisationId;
  //   this.apiKey = apiKey;
  //   this.name = name;
  // }
  async login(email: string, password: string) {
    this.validateSecret(this.secret);
    if (!this.organisationId) {
      throw new Error("Organisation ID is required for login");
    }
    return await loginUser({ email, password });
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

  async getTemplates(labels: string[] = [], emails: string[] = []): Promise<PaginatedResponse<Template>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      filters: {
        labels,
        emails,
      }
    };

    return await getTemplates(request);
  }

  async getContentVideos(labels: string[] = [], emails: string[] = []): Promise<PaginatedResponse<ContentVideo>> {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: BaseGetAssetsRequest = {
      apiKey: this.apiKey!,
      filters: {
        labels,
        emails,
      }
    };

    return await getContentVideos(request);
  }

  async createAvatar(personaId: string, settingsId: string, referenceId: string, avatarName: string, videoFile: File) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: CreateAvatarRequest = {
      apiKey: this.apiKey!,
      data: {
        persona_id: personaId,
        settings_id: settingsId,
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
  async generateVideo(pipelineId: string, body: JSON, emails: string[] = []) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    
    const request: CreateVideoRequest = {
      apiKey: this.apiKey!,
      videoId: pipelineId,
      data: body,
      emails,
      filters: {
        emails
      }
    };

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

