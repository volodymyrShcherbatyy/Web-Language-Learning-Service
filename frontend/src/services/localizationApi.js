import { apiRequest } from './apiClient';

export const getLocalization = (languageCode) =>
  apiRequest(`/localization?lang=${encodeURIComponent(languageCode)}`, {
    cache: true,
    cacheTtlMs: 5 * 60_000,
  });
