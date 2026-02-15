import { apiRequest } from './apiClient';

export const login = ({ email, password }) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    cache: false,
  });

export const register = ({ email, password }) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: { email, password },
    cache: false,
  });
