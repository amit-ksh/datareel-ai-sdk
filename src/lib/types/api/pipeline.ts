import type {
  BaseGetAssetsRequest,
  BaseVideoRequest,
  RenderSetting,
} from "./common";

export interface GetPipelinesRequest extends BaseGetAssetsRequest {}

export interface CreateVideoRequest extends BaseVideoRequest {
  pipelineId: string;
  name: string;
  assignee: string;
  approve: boolean;
  lip_optimization: boolean;
  lip_sync_model: string;
  data: JSON;
  whatsapp_data?: {
    contacts: string[];
    caption: string;
  };
  email_data?: {
    to: string[];
    subject: string;
  };
}

export interface GetVideoByIdRequest extends Omit<BaseGetAssetsRequest, 'page'> {
  videoId: string;
}

type ComponentType = "lipsync" | "content" | "presentation";
type ComponentAssetType = "static" | "dynamic";
export interface Pipeline {
  pipeline_name: string;
  reference_id: string | null;
  settings_id: string | null;
  delete: boolean;
  created_at: string;
  approved_at: string | null;
  avatar_id: string;
  data: {
    data: Array<{
      id: string;
      type: ComponentType;
      name: string;
      avatar: {
        type: ComponentAssetType;
        avatar_id: string;
      };
      voice: {
        type: ComponentAssetType;
        voice_id: string;
      };
      template: {
        type: ComponentAssetType;
        template_id: string;
      };
      text?: {
        type: ComponentAssetType;
        text: string;
      };
      language: {
        type: ComponentAssetType;
        iso: string;
      };
      content:
        | {
            type: ComponentAssetType;
            content_id: string;
            cluster_id: string | null;
          }
        | {
            type: ComponentAssetType;
            bullet_points: any | null;
            dictation: string | null;
            content_template_id: string | null;
            content_type: "data" | "raw";
            hold_duration: number | null;
            isChart: boolean;
            summary: string | null;
            prompt: string | null;
            template_id: string | null;
          };
    }>;
  };
  language: string;
  lip_optimization: boolean;
  lip_sync_model: "preview";
  template_id: string;
  voice_id: string;
  pipeline_id: string;
  render_settings: RenderSetting;
  user_label: string | null;
}


export interface ShareVideoEmailRequest extends BaseVideoRequest {
  videoId: string;
  subject: string;
  emails: string[];
}

export interface ShareVideoWhatsappRequest extends BaseVideoRequest {
  videoId: string;
  caption: string;
  contacts: string[];
}

export type ShareVideoRequest =
  | { via: 'email'; data: ShareVideoEmailRequest }
  | { via: 'whatsapp'; data: ShareVideoWhatsappRequest };
