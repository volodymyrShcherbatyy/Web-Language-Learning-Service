import { apiRequest } from './apiClient';

export const getLessonSummary = () => apiRequest('/lesson/summary', { cache: false });
