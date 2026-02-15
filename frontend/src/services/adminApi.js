import { apiRequest, buildQueryString, clearApiCache } from './apiClient';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const withApiError = async (request) => {
  try {
    return await request();
  } catch (error) {
    throw new ApiError(error.message, error.status);
  }
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

export const getConcepts = ({ page, limit, search, sortBy, sortOrder } = {}) =>
  withApiError(() => apiRequest(`/admin/concepts${buildQueryString({ page, limit, search, sortBy, sortOrder })}`));

export const createConcept = ({ type, difficulty }) =>
  withApiError(() =>
    apiRequest('/admin/concepts', {
      method: 'POST',
      body: { type, difficulty },
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/concepts');
      return data;
    })
  );

export const updateConcept = (id, { type, difficulty }) =>
  withApiError(() =>
    apiRequest(`/admin/concepts/${id}`, {
      method: 'PUT',
      body: { type, difficulty },
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/concepts');
      return data;
    })
  );

export const deleteConcept = (id) =>
  withApiError(() =>
    apiRequest(`/admin/concepts/${id}`, {
      method: 'DELETE',
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/concepts');
      return data;
    })
  );

export const createTranslation = (payload) =>
  withApiError(() =>
    apiRequest('/admin/translations', {
      method: 'POST',
      body: payload,
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/concepts');
      return data;
    })
  );

export const updateTranslation = (id, payload) =>
  withApiError(() =>
    apiRequest(`/admin/translations/${id}`, {
      method: 'PUT',
      body: payload,
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/concepts');
      return data;
    })
  );

export const deleteTranslation = (id) =>
  withApiError(() =>
    apiRequest(`/admin/translations/${id}`, {
      method: 'DELETE',
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/concepts');
      return data;
    })
  );

export const getMedia = ({ conceptId } = {}) =>
  withApiError(() => apiRequest(`/admin/media${buildQueryString({ conceptId })}`));

export const uploadMedia = ({ file, mediaType, conceptId }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('media_type', mediaType);
  formData.append('concept_id', conceptId);

  return withApiError(() =>
    apiRequest('/admin/media', {
      method: 'POST',
      body: formData,
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/media');
      return data;
    })
  );
};

export const deleteMedia = (id) =>
  withApiError(() =>
    apiRequest(`/admin/media/${id}`, {
      method: 'DELETE',
      cache: false,
    }).then((data) => {
      clearApiCache('/admin/media');
      return data;
    })
  );
