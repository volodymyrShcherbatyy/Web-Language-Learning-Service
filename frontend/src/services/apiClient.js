import { getToken, removeToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const DEFAULT_HEADERS = {
  Accept: 'application/json',
};
const GET_CACHE_TTL_MS = 15_000;

const getCacheKey = (url, headers = {}) => `${url}::${JSON.stringify(headers)}`;

const responseCache = new Map();

export class ApiClientError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', payload = null, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.payload = payload;
    this.isNetworkError = isNetworkError;
  }
}

const emitGlobalApiError = (error) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('api:error', { detail: error }));
};

const normalizeData = (payload) => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
};

const createError = (response, payload, fallbackMessage) => {
  const message = payload?.message || fallbackMessage || 'Request failed. Please try again.';

  if (response.status === 401) {
    removeToken();
    const error = new ApiClientError('Your session has expired. Please log in again.', {
      status: 401,
      code: 'UNAUTHORIZED',
      payload,
    });
    emitGlobalApiError(error);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return error;
  }

  const code =
    response.status === 403
      ? 'FORBIDDEN'
      : response.status >= 500
      ? 'SERVER_ERROR'
      : 'HTTP_ERROR';

  const error = new ApiClientError(message, {
    status: response.status,
    code,
    payload,
  });

  emitGlobalApiError(error);
  return error;
};

export const apiRequest = async (
  path,
  {
    method = 'GET',
    body,
    headers = {},
    expectJson = true,
    cache = method === 'GET',
    cacheTtlMs = GET_CACHE_TTL_MS,
  } = {}
) => {
  const token = getToken();
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const requestHeaders = {
    ...DEFAULT_HEADERS,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const url = `${API_BASE_URL}${path}`;
  const cacheKey = getCacheKey(url, requestHeaders);

  if (cache && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < cacheTtlMs) {
      return cached.value;
    }
    responseCache.delete(cacheKey);
  }

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body && !isFormData ? JSON.stringify(body) : body,
    });
  } catch {
    const networkError = new ApiClientError('Network error. Please check your connection and retry.', {
      code: 'NETWORK_ERROR',
      isNetworkError: true,
    });
    emitGlobalApiError(networkError);
    throw networkError;
  }

  if (response.status === 204) {
    return null;
  }

  const payload = expectJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok || payload?.success === false) {
    throw createError(response, payload, 'Request failed. Please try again.');
  }

  const normalized = normalizeData(payload);

  if (cache) {
    responseCache.set(cacheKey, {
      value: normalized,
      timestamp: Date.now(),
    });
  }

  return normalized;
};

export const clearApiCache = (pathPrefix = '') => {
  if (!pathPrefix) {
    responseCache.clear();
    return;
  }

  responseCache.forEach((_, key) => {
    if (key.includes(`${API_BASE_URL}${pathPrefix}`)) {
      responseCache.delete(key);
    }
  });
};

export const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};
