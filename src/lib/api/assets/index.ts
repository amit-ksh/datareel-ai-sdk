import { VideoAxios } from ".."
import { GetAvatarByIdRequest, GetAvatarsRequest } from "../../types"
import { prepareAssetFilters } from "../common"

export const getAvatars = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  return VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  })
}

export const getAvatarById = async (data: GetAvatarByIdRequest) => {
  return VideoAxios.get(`/api/v1/video/view?avatar_id=${data.avatarId}`, {
    headers: { api_key: data.apiKey },
  })
}

export const getVoices = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  return VideoAxios.get(`/api/v1/voice/list`, {
    headers: { api_key: data.apiKey },
    params,
  })
}

export const getVoiceById = async (data: GetAvatarByIdRequest) => {
  return VideoAxios.get(`/api/v1/voice/view?voice_id=${data.avatarId}`, {
    headers: { api_key: data.apiKey },
  })
}

export const getTemplates = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  return VideoAxios.get(`/api/v1/voice/list`, {
    headers: { api_key: data.apiKey },
    params,
  })
}

export const getTemplatesById = async (data: GetAvatarByIdRequest) => {
  return VideoAxios.get(`/api/v1/voice/view?voice_id=${data.avatarId}`, {
    headers: { api_key: data.apiKey },
  })
}

export const getContentVideos = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  return VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  })
}

export const getContentVideoById = async (data: GetAvatarByIdRequest) => {
  return VideoAxios.get(`/api/v1/video/view?avatar_id=${data.avatarId}`, {
    headers: { api_key: data.apiKey },
  })
}

export const getPersonas = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  return VideoAxios.get(`/api/v1/persona/list`, {
    headers: { api_key: data.apiKey },
    params,
  })
}

