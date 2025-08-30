import axios from "axios"

export const ENVIRONMENT_TYPE: 'production' | 'development' = 'development'

const ENVIRONMENTS = {
  production: {
    auth: 'https://auth.datareel.ai/',
    video: 'https://video.datareel.ai/',
  },
  development: {
    auth: 'https://auth.dev.datareel.ai/',
    video: 'https://video.dev.datareel.ai/',
  },
} as const

const API_VERSION = {
  V1: 'api/v1/',
  V2: 'api/v2/',
}

export const AuthAxios = axios.create({
  baseURL: ENVIRONMENTS[ENVIRONMENT_TYPE].auth+API_VERSION.V1,
  withCredentials: true,
})

export const VideoAxios = axios.create({
  baseURL: ENVIRONMENTS[ENVIRONMENT_TYPE].video+API_VERSION.V2,
})
