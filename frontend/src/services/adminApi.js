import { getToken, removeToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const getAuthHeaders = (isMultipart = false) => {
  const token = getToken();

  return {
    ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const extractPayload = (payload) => {
  if (payload?.data !== undefined) {
    return payload.data;
  }

  return payload;
};

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    removeToken();
    throw new ApiError('Your session has expired. Please log in again.', response.status);
  }

  if (response.status === 403) {
    throw new ApiError(payload.message || 'You do not have access to this resource.', response.status);
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload.message || 'Request failed. Please try again.', response.status);
  }

  return extractPayload(payload);
};

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

export const getAdminStats = async () => {
  const [concepts, media] = await Promise.all([getConcepts(), getMedia()]);

  const conceptList = Array.isArray(concepts?.items) ? concepts.items : concepts;
  const mediaList = Array.isArray(media?.items) ? media.items : media;

  const totalConcepts = Array.isArray(conceptList) ? conceptList.length : concepts?.total || 0;
  const totalMedia = Array.isArray(mediaList) ? mediaList.length : media?.total || 0;
  const totalTranslations = Array.isArray(conceptList)
    ? conceptList.reduce((total, concept) => total + (concept.translations?.length || concept.languages_count || 0), 0)
    : 0;

  return {
    totalConcepts,
    totalTranslations,
    totalMedia,
  };
};

export const getConcepts = async ({ page, limit, search, sortBy, sortOrder } = {}) => {
  const query = buildQuery({ page, limit, search, sortBy, sortOrder });
  const response = await fetch(`${API_BASE_URL}/admin/concepts${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const createConcept = async ({ type, difficulty }) => {
  const response = await fetch(`${API_BASE_URL}/admin/concepts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ type, difficulty }),
  });

  return handleResponse(response);
};

export const updateConcept = async (id, { type, difficulty }) => {
  const response = await fetch(`${API_BASE_URL}/admin/concepts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ type, difficulty }),
  });

  return handleResponse(response);
};

export const deleteConcept = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/concepts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const createTranslation = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/translations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const updateTranslation = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/admin/translations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const deleteTranslation = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/translations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const getMedia = async ({ conceptId } = {}) => {
  const query = buildQuery({ conceptId });
  const response = await fetch(`${API_BASE_URL}/admin/media${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const uploadMedia = async ({ file, mediaType, conceptId }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('media_type', mediaType);
  formData.append('concept_id', conceptId);

  const response = await fetch(`${API_BASE_URL}/admin/media`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });

  return handleResponse(response);
};

export const deleteMedia = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};
