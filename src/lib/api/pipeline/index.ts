import { VideoAxios } from ".."
import type { GetAvatarsRequest, GetVideoByIdRequest, CreateVideoRequest } from "../../types"
import { prepareAssetFilters } from "../common"

export const getPipelines = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  const resp = await VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  })

  return resp.data
}

export const createVideo = async (data: CreateVideoRequest) => {
  const resp = await VideoAxios.post(`/api/v1/video/create`, {
    video_id: data.videoId,
    data: data.data,
  }, {
    headers: { api_key: data.apiKey },
  })
  return resp.data
}

export const getVideoById = async (data: GetVideoByIdRequest) => {
  const resp = await VideoAxios.get(`/api/v1/video/view?video_id=${data.videoId}`, {
    headers: { api_key: data.apiKey },
  })
  return resp.data
}

export const getOrganisationLanguages = async (): Promise<string[]> => {
  const resp = await VideoAxios.get(`/api/v1/pipeline/languages`)
  return resp.data
}
