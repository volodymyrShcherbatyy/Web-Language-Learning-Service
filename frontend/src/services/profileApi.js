import { apiRequest, clearApiCache } from './apiClient';

export const getLanguages = () => apiRequest('/languages');

export const getProfile = () => apiRequest('/profile', { cache: false });

export const updateProfileLanguages = ({ native_language_id, learning_language_id, interface_language_id }) =>
  apiRequest('/profile/languages', {
    method: 'PUT',
    body: {
      native_language_id,
      learning_language_id,
      interface_language_id,
    },
    cache: false,
  }).then((data) => {
    clearApiCache('/profile');
    return data;
  });
