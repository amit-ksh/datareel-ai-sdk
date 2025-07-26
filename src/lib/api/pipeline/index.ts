import { VideoAxios } from ".."
import { GetAvatarByIdRequest, GetAvatarsRequest, GetVideoByIdRequest, CreateVideoRequest } from "../../types"
import { prepareAssetFilters } from "../common"

export const getPipelines = async (data: GetAvatarsRequest) => {
  const params = prepareAssetFilters(data)

  return VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  })
}

export const getPipelinesById = async (data: GetAvatarByIdRequest) => {
  return VideoAxios.get(`/api/v1/video/view?avatar_id=${data.avatarId}`, {
    headers: { api_key: data.apiKey },
  })
}


export const createVideo = async (data: CreateVideoRequest) => {
  return VideoAxios.post(`/api/v1/video/create`, {
    video_id: data.videoId,
    data: data.data,
  }, {
    headers: { api_key: data.apiKey },
  })
}

export const getVideoById = async (data: GetVideoByIdRequest) => {
  return VideoAxios.get(`/api/v1/video/view?video_id=${data.videoId}`, {
    headers: { api_key: data.apiKey },
  })
}
