import axios from "axios"

export const AuthAxios = axios.create({
  baseURL: 'https://auth.dev.datareel.ai/',
  withCredentials: true,
})

export const VideoAxios = axios.create({
  baseURL: 'https://video.dev.datareel.ai/',
})
