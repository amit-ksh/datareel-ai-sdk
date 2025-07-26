import { BaseGetAssetsRequest } from "../types/api";

export const prepareAssetFilters = (data: BaseGetAssetsRequest) => {
  const params = new URLSearchParams();
  if (data.filters.labels) {
    params.append("from_label", data.filters.labels.join(","));
  }
  if (data.filters.emails) {
    params.append("from_email", data.filters.emails.join(","));
  }
  return params;
}
