import { AuthAxios } from "..";
import type { CreateOrganisationRequest, CreateOrganisationResponse, UserLoginRequest, ValidateUserRequest, ValidateUserResponse } from "../../types";

export const createOrganisation = async (data: CreateOrganisationRequest): Promise<CreateOrganisationResponse> => {
  const resp  = await AuthAxios.post('admin/admin/create_org', data)
  return resp.data;
}

export const validateUser = async (data: ValidateUserRequest): Promise<ValidateUserResponse> => {
  const resp = await AuthAxios.post('admin/admin/validate_user', data)
  return resp.data;
}

export const loginUser = async (data: UserLoginRequest): Promise<{success: boolean}> => {
  const resp = await AuthAxios.post('auth/tenant/login', data)
  return resp.data;
}
