export interface BaseVideoRequest {
  apiKey: string;
}

export interface BaseGetAssetsRequest extends BaseVideoRequest {
  filters: {
    labels?: string[];
    emails?: string[];
  };
}
