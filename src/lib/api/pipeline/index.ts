import { VideoAxios } from ".."
import type { GetAvatarsRequest, GetVideoByIdRequest, CreateVideoRequest, BaseGetAssetsRequest, Pipeline, PaginatedResponse, BaseVideoRequest } from "../../types"
import { prepareAssetFilters } from "../common"

export const getPipelines = async (data: GetAvatarsRequest): Promise<PaginatedResponse<Pipeline>> => {
  const params = prepareAssetFilters(data)

  console.log(`Fetching pipelines with API key: ${data.apiKey}`, data, params)
  const resp = await VideoAxios.get(`/api/v1/pipeline/list`, {
    headers: { api_key: data.apiKey },
    params,
  })

  console.log(`Pipelines fetched:`, resp.data)
  return resp.data
}

export const fetchPipelineFormData = async (data: BaseVideoRequest & {pipelineId: string}): Promise<Pipeline> => {
  const resp = await VideoAxios.get(`/api/v1/integrate/pipeline/${data.pipelineId}`, {
    headers: { api_key: data.apiKey },
  })

  return resp.data
}

export const createVideo = async (data: CreateVideoRequest) => {
  const resp = await VideoAxios.post(`/api/v1/run/${data.pipelineId}`, {
    name: data.name,
    assignee: data.assignee,
    lip_sync_model: data.lip_sync_model,
    lip_optimization: data.lip_optimization,
    approve: data.approve,
    data: data.data,
  }, {
    headers: { api_key: data.apiKey },
  })
  return resp.data
}

export const getVideoById = async (data: GetVideoByIdRequest) => {
  const resp = await VideoAxios.get(`/api/v1/list/pipeline/results/${data.videoId}`, {
    headers: { api_key: data.apiKey },
  })
  return resp.data
}

export const getOrganisationLanguages = async (data: BaseGetAssetsRequest): Promise<string[]> => {
  const resp = await VideoAxios.get(`/api/v1/pipeline/languages`, {
    headers: { api_key: data.apiKey },
  })

  console.log(resp?.data)
  return resp.data.languages
}


