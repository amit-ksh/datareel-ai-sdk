import type { DataReelConstructor, BaseGetAssetsRequest, PaginatedResponse, Avatar, Voice, Template, ContentVideo, Persona, Pipeline, CreateVideoRequest, GetVideoByIdRequest } from "../types";
import { getAvatars, getVoices, getTemplates, getContentVideos, getPersonas } from "../api/assets";
import { getPipelines, createVideo, getVideoById } from "../api/pipeline";


export class DataReel {
  organisationId?: string;
  private apiKey?: string;
  secret: string;

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
  async initOrganisation(email: string) {}

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

  async getPipelines(labels: string[] = [], emails: string[] = [], languages: string[] = []): Promise<PaginatedResponse<Pipeline>> {
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
