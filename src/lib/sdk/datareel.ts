import type { DataReelConstructor } from "../types";


export class DataReel {
  organisationId?: string;
  apiKey?: string;
  secret: string;

  // User information
  email?: string;
  name?: string;

  constructor({secret, organisationId}: DataReelConstructor) {
    this.secret = secret
    this.organisationId = organisationId

  }

  private _validateSecret(secret: string) {
    if (this.secret !== secret) {
      throw new Error("Invalid secret");
    }
  }

  private _validateOrganisationId(organisationId: string) {
    if (!this.organisationId || this.organisationId !== organisationId) {
      throw new Error("Invalid organisation ID");
    }
  }

  private _validateApiKey(apiKey: string) {
    if (!this.apiKey || this.apiKey !== apiKey) {
      throw new Error("Invalid API key");
    }
  }

  private validateCredentials(secret: string, organisationId: string, apiKey: string) {
    this._validateSecret(secret);
    this._validateOrganisationId(organisationId);
    this._validateApiKey(apiKey);
  }

  // USER MANAGEMENT
  async initOrganisation(email: string) {}

  async validateUser(organisationId: string, apiKey: string, email: string, name: string) {
    this.email = email;
    this.name = name;
    this.organisationId = organisationId;
    this.apiKey = apiKey;
  }

  async login(organisationId: string, apiKey: string, email: string, name: string) {
    this.email = email;
    this.organisationId = organisationId;
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
  async getPersona(labels: string[], emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');

    return {}
  }

  async getAvatars(labels: string[], emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return []
  }

  async getVoices(labels: string[], emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return []
  }

  async getTemplates(labels: string[], emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return []
  }

  async getContentVideos(labels: string[], emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return []
  }

  async getPipelines(labels: string[], emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return []
  }

  // VIDEO GENERATION

  async generateVideo(pipelineId: string, body: JSON, emails: string[]) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return {}
  }

  async getVideoStatus(videoId: string) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return {}
  }

  async getVideo(videoId: string) {
    this.validateCredentials(this.secret, this.organisationId || '', this.apiKey || '');
    return {}
  }

}
