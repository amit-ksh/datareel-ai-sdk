import axios from "axios"

export const AuthAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
})

export const VideoAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_VIDEO_API_BASE_URL,
})
