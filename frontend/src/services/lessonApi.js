import { getToken, removeToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  if (payload.data && typeof payload.data === 'object') {
    return payload.data;
  }

  return payload;
};

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    removeToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Failed to process lesson request.');
  }

  return normalizePayload(payload);
};

export const startLessonSession = async () => {
  const response = await fetch(`${API_BASE_URL}/lesson/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

export const getNextExercise = async () => {
  const response = await fetch(`${API_BASE_URL}/lesson/next`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 404 || response.status === 204) {
    return null;
  }

  return handleResponse(response);
};

export const submitLessonAnswer = async ({ session_id, exercise_id, answer_id }) => {
  const response = await fetch(`${API_BASE_URL}/lesson/answer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      session_id,
      exercise_id,
      answer_id,
    }),
  });

  return handleResponse(response);
};
