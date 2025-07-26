import { BaseGetAssetsRequest } from "./common";

export interface GetPipelinesRequest extends BaseGetAssetsRequest {}

export interface CreateVideoRequest extends BaseGetAssetsRequest {
  videoId: string;
  data: JSON;
  emails?: string[];
}

export interface GetVideoByIdRequest extends BaseGetAssetsRequest {
  videoId: string;
}
