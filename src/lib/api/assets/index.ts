import { VideoAxios } from "..";
import type {
  Avatar,
  ContentVideo,
  BaseGetAssetsRequest,
  PaginatedResponse,
  Persona,
  Template,
  Voice,
  CreateAvatarRequest,
} from "../../types";
import { prepareAssetFilters } from "../common";

export const getAvatars = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Avatar>> => {
  const params = prepareAssetFilters(data);

  const resp = await VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const getVoices = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Voice>> => {
  const params = prepareAssetFilters(data);

  const resp = await VideoAxios.get(`/api/v1/voice/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};
export const getTemplates = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Template>> => {
  const params = prepareAssetFilters(data);

  const resp = await VideoAxios.get(`/api/v1/template/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const getContentVideos = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<ContentVideo>> => {
  const params = prepareAssetFilters(data);
  console.log(`Fetching content videos with API key: ${data.apiKey}`, data, params);

  const resp = await VideoAxios.get(`/api/v1/cluster/organisation/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  console.log(`Content videos fetched:`, resp.data);
  return resp.data;
};

export const getPersonas = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Persona>> => {
  const params = prepareAssetFilters(data);

  const resp = await VideoAxios.get(`/api/v1/persona/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const createAvatar = async (
  request: CreateAvatarRequest
): Promise<{ video_id: string }> => {
  const params = new URLSearchParams();
 params.append("persona_id", request.data.persona_id);
 
  const formData = new FormData();
  formData.append("video", request.data.video);
  formData.append("avatar_name", request.data.avatar_name);
  formData.append("reference_id", request.data.reference_id);

  if (request.data.settings_id === "default") request.data.settings_id = "";
  formData.append("settings_id", request.data.settings_id);

  return VideoAxios.post(
    `/api/v1/video/upload?${params.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        api_key: request.apiKey,
      },
    }
  );
};
