import { AuthAxios } from "..";
import type { CreateOrganisationRequest, CreateOrganisationResponse, ValidateUserRequest, ValidateUserResponse } from "../../types";

export const createOrganisation = async (data: CreateOrganisationRequest): Promise<CreateOrganisationResponse> => {
  return AuthAxios.post('/api/v1/admin/admin/create_org', data)
}

export const validateUser = async (data: ValidateUserRequest): Promise<ValidateUserResponse> => {
  return AuthAxios.post('/api/v1/admin/admin/validate_user', data)
}
