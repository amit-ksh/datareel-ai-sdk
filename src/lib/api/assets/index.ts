import { VideoAxios } from "..";
import type {
  Avatar,
  ContentVideo,
  BaseGetAssetsRequest,
  PaginatedResponse,
  Persona,
  Template,
  Voice,
  CreateAvatarRequest,
} from "../../types";
import { prepareAssetFilters } from "../common";

export const getAvatars = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Avatar>> => {
  const params = prepareAssetFilters(data);
  params.append("page", data.page?.toString() || "1");

  const resp = await VideoAxios.get(`/api/v1/video/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const getVoices = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Voice>> => {
  const params = prepareAssetFilters(data);
  params.append("page", data.page?.toString() || "1");

  const resp = await VideoAxios.get(`/api/v1/voice/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};
export const getTemplates = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Template>> => {
  const params = prepareAssetFilters(data);
  params.append("page", data.page?.toString() || "1");

  const resp = await VideoAxios.get(`/api/v1/template/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const getContentVideos = async (
  data: BaseGetAssetsRequest & {
    cluster_id?: string;
  }
): Promise<{
  data: ContentVideo;
  total_pages: number;
  current_page: number;
}> => {
  const params = prepareAssetFilters(data);
  params.append("cluster_id", data.cluster_id || "");
  params.append("page", data.page?.toString() || "1");

  const resp = await VideoAxios.get(`/api/v1/view/cluster`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const getPersonas = async (
  data: BaseGetAssetsRequest
): Promise<PaginatedResponse<Persona>> => {
  const params = prepareAssetFilters(data);
  params.set('page_num', data.page?.toString() || "1");
  params.set('onboarded', String(true));

  const resp = await VideoAxios.get(`/api/v1/persona/list`, {
    headers: { api_key: data.apiKey },
    params,
  });

  return resp.data;
};

export const createVideoAvatar = async (
  request: CreateAvatarRequest
): Promise<{ video_id: string }> => {
  const params = new URLSearchParams();
  if (request.data.persona_id) {
    params.append("persona_id", request.data.persona_id);
  }
 
  const formData = new FormData();
  formData.append("video", request.data.video);
  formData.append("avatar_name", request.data.avatar_name);
  formData.append("reference_id", request.data.reference_id);

  if (request.data.settings_id === "default") request.data.settings_id = "";
  formData.append("settings_id", request.data.settings_id);

  const response = await VideoAxios.post(
    `/api/v1/video/upload?${params.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        api_key: request.apiKey,
      },
    }
  );

  return response.data;
};


export const createVoice = async (request: FormData, apiKey: string) => {
  return VideoAxios.post(`/api/v1/voice/upload`, request, {
    headers: {
      'Content-Type': 'multipart/form-data',
      api_key: apiKey,
    },
  })
}


export const createPersona = async (request: FormData, apiKey: string) => {
  return VideoAxios.post(`/api/v1/persona/create`, request, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      api_key: apiKey,
    },
  })
}


export const updatePersona = async (request: {
  persona_id: string;
  name: string;
  default_avatar?: string;
  default_voice?: string;
  onboarded?: boolean;
  consent?: boolean;
}, apiKey: string) => {
  return VideoAxios.put(
    `/api/v1/persona/update`,
    request,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        api_key: apiKey,
      },
    },
  )
}

export const deletePersona = async (request: { persona_id: string }, apiKey: string) => {
  return VideoAxios.delete(`/api/v1/persona/delete`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      api_key: apiKey,
    },
    data: request,
  });
};

export const deleteAvatar = async (request: { video_id: string }, apiKey: string) => {
  return VideoAxios.delete(`/api/v1/video/delete`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      api_key: apiKey,
    },
    data: request,
  });
};

export const deleteVoice = async (request: { voice_id: string }, apiKey: string) => {
  return VideoAxios.delete(`/api/v1/voice/delete`, {
    data: request,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      api_key: apiKey,
    },
  });
};

const USER_LABEL_ASSET_API_MAP = {
  persona: {
    endpoint: '/api/v1/persona/user_labels',
  },
  content: {
    endpoint: '/api/v1/cluster/user_labels',
  },
  video_content: {
    endpoint: '/api/v1/video/user_labels',
  },
} as const;

type AssetType = keyof typeof USER_LABEL_ASSET_API_MAP;

export const getOrganisationUserLabels = async ({ 
  apiKey, 
  assetType 
}: {
  apiKey: string;
  assetType: AssetType;
}): Promise<{
  data: string[];
}> => {
  const response = await VideoAxios.get(USER_LABEL_ASSET_API_MAP[assetType].endpoint, {
    headers: { api_key: apiKey },
  });

  // return {data: ["educational video", "report", "custom script"] || response.data.user_labels.filter(Boolean) || []};
  return {data: ["educational video", "report", "custom script"] };
}
