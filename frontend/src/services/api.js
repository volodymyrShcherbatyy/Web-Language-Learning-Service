import { getToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const createHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Request failed. Please try again.');
  }

  return payload;
};

export const login = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};

export const register = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
};
