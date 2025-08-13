import type { BaseGetAssetsRequest } from "../types/api";

export const prepareAssetFilters = (data: BaseGetAssetsRequest) => {
  const params = new URLSearchParams();
  if (data.filters.user_label) {
    params.append("user_label", data.filters.user_label);
  }
  if (data.filters.languages) {
    params.append("language", data.filters.languages.join(","));
  }

  return params;
}
