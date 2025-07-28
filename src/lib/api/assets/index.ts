import { VideoAxios } from "..";
import type {
  Avatar,
  ContentVideo,
  BaseGetAssetsRequest,
  PaginatedResponse,
  Persona,
  Template,
  Voice,
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

  const resp = await VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

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
