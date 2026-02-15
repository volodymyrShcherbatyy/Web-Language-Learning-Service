import { getToken, removeToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const extractData = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload.data && typeof payload.data === 'object') {
      return payload.data;
    }

    return payload;
  }

  return null;
};

const handleApiResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    removeToken();
    throw new Error('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed. Please try again.');
  }

  return extractData(payload);
};

export const getLanguages = async () => {
  const response = await fetch(`${API_BASE_URL}/languages`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const updateProfileLanguages = async ({
  native_language_id,
  learning_language_id,
  interface_language_id,
}) => {
  const response = await fetch(`${API_BASE_URL}/profile/languages`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      native_language_id,
      learning_language_id,
      interface_language_id,
    }),
  });

  return handleApiResponse(response);
};
