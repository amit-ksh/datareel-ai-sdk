import type { BaseGetAssetsRequest, RenderSetting } from "./common";

export interface GetAvatarsRequest extends BaseGetAssetsRequest {}

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  s3_url: string;
  file_name: string | null;
  s3_url_thumbnail: string;
  created_at: string;
  reference_id: string | null;
  settings_id: string | null;
  render_settings: RenderSetting;
}

export interface CreateAvatarRequest {
  apiKey: string;
  data: {
    settings_id: string;
    reference_id: string;
    avatar_name: string;
    persona_id?: string;
    video: File;
  };
}

export interface Persona {
  _id: string;
  name: string;
  email: string;
  organisation_id: string;
  reference_id: string;
  default_avatar: string;
  default_voice: string;
  has_avatars: boolean;
  has_voices: boolean;
}

export interface Voice {
  _id: string;
  voice_id: string;
  organisation_id: string;
  voice_label: string;
  eleven_labs_voice_id: string;
  type: string;
  model: string;
  model_configuration: {
    voice_model: string;
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
    use_speaker_boost: boolean;
    language: string;
  };
  uploaded_urls: string[];
  s3_uploaded_urls: string[];
  reference_id: string;
  persona_id: string;
  delete: boolean;
  created_at: string;
}

export interface Template {
  template_id: string;
  s3_url: string;
  image: string;
  template_label: string;
  reference_id: string | null;
  created_at: string;
  user_label: string | null;
  render_settings: RenderSetting;
}

export interface Cluster {
  cluster_id: string;
  cluster_name: string;
  created_at: string;
  standard_videos: string[];
  no_of_files: number;
  shared_code: string | null;
  thumbnail: string;
}

export interface Video {
  video_id: string;
  cluster_id: string;
  voice_over: boolean;
  video_name: string;
  voice_over_config: Array<{
    iso: string;
    content: string;
  }>;
  picture_in_picture: boolean;
  picture_in_picture_config: {
    radius: number;
    x_cordinate: number;
    y_cordinate: number;
  } | null;
  s3_url: string;
  s3_thumbnail_url: string;
  reference_id: string | null;
  created_at: string;
  render_settings: RenderSetting;
  user_label: string | null;
}
export interface ContentVideo {
  cluster_id: string;
  cluster_name: string;
  created_at: string;
  shareable: boolean;
  shared_code: string | null;
  standard_videos: string[];
  videos: Array<Video>;
}
