import { VideoAxios } from ".."
import type { GetAvatarsRequest, GetVideoByIdRequest, CreateVideoRequest, BaseGetAssetsRequest, Pipeline, PaginatedResponse, BaseVideoRequest, ShareVideoEmailRequest, ShareVideoWhatsappRequest, ShareVideoRequest } from "../../types"
import { prepareAssetFilters } from "../common"

export const getPipelines = async (data: GetAvatarsRequest): Promise<PaginatedResponse<Pipeline>> => {
  const params = prepareAssetFilters(data)
  params.append("page", data.page?.toString() || "1");

  const resp = await VideoAxios.get(`/api/v1/pipeline/list`, {
    headers: { api_key: data.apiKey },
    params,
  })

  return resp.data
}

export const fetchPipelineFormData = async (data: BaseVideoRequest & {pipelineId: string}): Promise<Pipeline> => {
  const resp = await VideoAxios.get(`/api/v1/integrate/pipeline/${data.pipelineId}`, {
    headers: { api_key: data.apiKey },
  })

  return resp.data
}

export const fetchPipelineDataById = async (data: BaseVideoRequest & {pipelineId: string}): Promise<{data: Pipeline}> => {
  const resp = await VideoAxios.get(`/api/v1/pipeline/view?pipeline_id=${data.pipelineId}`, {
    headers: { api_key: data.apiKey }
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
    whatsapp_data: data.whatsapp_data,
    email_data: data.email_data,
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

export const getOrganisationLanguages = async (data: Omit<BaseGetAssetsRequest, 'page'>): Promise<string[]> => {
  const resp = await VideoAxios.get(`/api/v1/pipeline/languages`, {
    headers: { api_key: data.apiKey },
  })

  return resp.data.languages
}


const shareVideoViaEmail = async ({
  apiKey,
  videoId,
  subject,
  emails,
}: ShareVideoEmailRequest) => {
  return await VideoAxios.post(
    `/api/v1/resend/email?results_id=${videoId}&subject=${subject}`,
    emails,
    {
      headers: {
        Api_key: apiKey,
      },
    },
  )
}

const shareVideoViaWhatsapp = async ({
  apiKey,
  videoId,
  caption,
  contacts,
}: ShareVideoWhatsappRequest) => {
  return await VideoAxios.post(
    `/api/v1/resend/whatsapp?results_id=${videoId}&caption=${caption}`,
    contacts,
    {
      headers: {
        Api_key: apiKey,
      },
    },
  )
}


export const shareVideo= ({data, via}: ShareVideoRequest) => {
  if (via === "email") {
    return shareVideoViaEmail(data);
  } else if (via === "whatsapp") {
    return shareVideoViaWhatsapp(data);
  }
}
