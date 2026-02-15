import { apiRequest, clearApiCache } from './apiClient';

export const startLessonSession = async () => {
  clearApiCache('/lesson/next');
  return apiRequest('/lesson/start', {
    method: 'POST',
    cache: false,
  });
};

export const getNextExercise = async () => {
  try {
    return await apiRequest('/lesson/next', { cache: false });
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
};

export const submitLessonAnswer = ({ session_id, exercise_id, answer_id }) =>
  apiRequest('/lesson/answer', {
    method: 'POST',
    body: {
      session_id,
      exercise_id,
      answer_id,
    },
    cache: false,
  });
