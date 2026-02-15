import { getToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getLocalization = async (languageCode) => {
  const response = await fetch(`${API_BASE_URL}/localization?lang=${encodeURIComponent(languageCode)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to load localization data.');
  }

  if (payload && typeof payload === 'object' && payload.success && payload.data && typeof payload.data === 'object') {
    return payload.data;
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload;
  }

  throw new Error('Localization response is invalid.');
};
