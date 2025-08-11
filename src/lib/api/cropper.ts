import { VideoAxios } from "."
import type { 
  CropVideoRequest, 
  TrimVideoAudioRequest, 
} from "../types/api/cropper"
import type { AxiosResponse } from "axios"

export const cropVideo = async ({ 
  videoFile, 
  crop, 
  scale 
}: CropVideoRequest): Promise<AxiosResponse<Blob>> => {
  const formData = new FormData()
  const file = videoFile
  formData.append('file', file)
  formData.set('x', crop.x.toString())
  formData.set('y', crop.y.toString())
  formData.set('width', crop.width.toString())
  formData.set('height', crop.height.toString())
  scale.width = scale.width % 2 === 0 ? scale.width : scale.width - 1
  scale.height = scale.height % 2 === 0 ? scale.height : scale.height - 1
  formData.set('scale_width', scale.width.toString())
  formData.set('scale_height', scale.height.toString())

  return VideoAxios.post('/api/v1/video/crop-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'video/mp4',
    },
    responseType: 'arraybuffer',
    transformResponse: (data) => {
      const contentType = data.type || 'video/mp4'
      return new Blob([data], { type: contentType })
    },
  })
}


export const trimVideoAudio = async ({
  videoFile,
  trim,
  scale = null,
  media,
}: TrimVideoAudioRequest): Promise<AxiosResponse<Blob>> => {
  const formData = new FormData()

  formData.append('file', videoFile)
  formData.set('trim_start', String(trim.from))
  formData.set('trim_end', String(trim.to))
  formData.set('video', media.video.toString())
  formData.set('audio', media.audio.toString())
  if (scale) {
    scale.width = scale.width % 2 === 0 ? scale.width : scale.width - 1
    scale.height = scale.height % 2 === 0 ? scale.height : scale.height - 1
    formData.set('scale_width', scale.width.toString())
    formData.set('scale_height', scale.height.toString())
  }

  return VideoAxios.post('/api/v1/video/trim-crop-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
    transformResponse: (data) => {
      const contentType = data.type || 'video/mp4'
      return new Blob([data], { type: contentType })
    },
  })
}
