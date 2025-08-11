import type { AxiosResponse } from "axios";

export interface CropParameters {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScaleParameters {
  width: number;
  height: number;
}

export interface TrimParameters {
  from: number;
  to: number;
}

export interface MediaParameters {
  video: boolean;
  audio: boolean;
}

export interface CropVideoRequest {
  videoFile: File;
  crop: CropParameters;
  scale: ScaleParameters;
}

export interface TrimVideoAudioRequest {
  videoFile: File;
  trim: TrimParameters;
  scale?: ScaleParameters | null;
  media: MediaParameters;
}

export interface VideoEditResponse {
  data: Blob;
}

export interface ExtractVideoRequest {
  videoFile: File;
  crop: CropParameters;
  scale: ScaleParameters;
}

export interface ExtractAudioRequest {
  videoFile: File;
  crop: CropParameters;
  scale: ScaleParameters;
}

export interface SeparateVideoAndAudioRequest {
  videoFile: File;
  crop: CropParameters;
  scale: ScaleParameters;
}

export interface SeparateVideoAndAudioResponse {
  video: AxiosResponse<Blob>;
  audio: AxiosResponse<Blob>;
}
