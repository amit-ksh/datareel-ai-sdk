export interface CreateOrganisationRequest {
  email: string;
  password: string;
  source_org_id: string;
  tenant_name: string;
  project_name: string;
}

export interface CreateOrganisationResponse {
  organisation_id: string;
  api_key: string;
}


export interface ValidateUserRequest {
  email: string;
  password: string;
  organisation_id: string;
}

export interface ValidateUserResponse {
  api_key: string;
}
