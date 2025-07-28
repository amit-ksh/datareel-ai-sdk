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
