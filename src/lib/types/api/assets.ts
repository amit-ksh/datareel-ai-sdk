import { BaseGetAssetsRequest, BaseVideoRequest } from "./common";

export interface GetAvatarsRequest extends BaseGetAssetsRequest {}

export interface GetAvatarByIdRequest extends BaseVideoRequest {
  avatarId: string;
}
