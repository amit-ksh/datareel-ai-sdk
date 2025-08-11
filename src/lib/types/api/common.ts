export interface BaseVideoRequest {
  apiKey: string;
}

export interface BaseGetAssetsRequest extends BaseVideoRequest {
  page: number;
  filters: {
    user_label?: string;
    emails?: string[];
    languages?: string[];
  };
}

export interface RenderSetting {
  settings_id: string | null;
  name: string;
  max_quality: number;
  canvas_dimensions: {
    width: number;
    height: number;
  };
  video_dimensions: {
    width: number;
    height: number;
  };
  center_coordinate: {
    x: number;
    y: number;
  };
  pip_radius: number | null;
  pip_position: { x: number; y: number } | null;
  pip_size: number | null;
}


export interface PaginatedResponse<T> {
  data: T[];
  total_pages: number;
  current_page: number;
}
