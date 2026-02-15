jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getClient: jest.fn()
}));

jest.mock('../../src/services/exerciseEngineService', () => ({
  generateExercise: jest.fn()
}));

jest.mock('../../src/services/progressUpdaterService', () => ({
  updateUserProgress: jest.fn()
}));

const db = require('../../src/config/db');
const { generateExercise } = require('../../src/services/exerciseEngineService');
const { updateUserProgress } = require('../../src/services/progressUpdaterService');
const lessonService = require('../../src/services/lessonService');

describe('Integration: sessions, progress tracking, prioritization constraints', () => {
  beforeEach(() => jest.clearAllMocks());

  test('marks completion and avoids extra exercises when queue empty', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7, total_exercises: 5, completed_exercises: 5, correct_answers: 3, wrong_answers: 2 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await lessonService.getNextExercise({ userId: 1, sessionId: 7, nativeLanguageCode: 'en', targetLanguageCode: 'es' });
    expect(res.done).toBe(true);
  });

  test('updates counters and writes logs on answer submission', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 7, total_exercises: 5, completed_exercises: 2, correct_answers: 1, wrong_answers: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 11, concept_id: 98, exercise_type: 'mcq', result: null }] })
      .mockResolvedValueOnce({ rows: [{ id: 7, total_exercises: 5, completed_exercises: 3, correct_answers: 2, wrong_answers: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    generateExercise.mockResolvedValue({ correct_answer: 'hola' });

    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 7, total_exercises: 5, completed_exercises: 3, correct_answers: 2, wrong_answers: 1 }] })
        .mockResolvedValueOnce({}),
      release: jest.fn()
    };

    db.getClient.mockResolvedValue(client);
    updateUserProgress.mockResolvedValue({ status: 'learning', total_correct: 2, total_wrong: 1 });

    const res = await lessonService.submitAnswer({
      userId: 1,
      sessionId: 7,
      exerciseId: 11,
      answer: 'hola',
      nativeLanguageCode: 'en',
      targetLanguageCode: 'es'
    });

    expect(res.is_correct).toBe(true);
    expect(res.progress.status).toBe('learning');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
  });
});
