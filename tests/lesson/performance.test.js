jest.mock('../../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../../src/services/exerciseEngineService', () => ({ generateExercise: jest.fn() }));

const db = require('../../src/config/db');
const { generateExercise } = require('../../src/services/exerciseEngineService');
const lessonService = require('../../src/services/lessonService');

describe('Basic performance checks', () => {
  beforeEach(() => jest.clearAllMocks());

  test('loads next exercise under 200ms with mocked data path', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 5, total_exercises: 10, completed_exercises: 1, correct_answers: 1, wrong_answers: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 50, concept_id: 90, exercise_type: 'mcq' }] });
    generateExercise.mockResolvedValue({ correct_answer: 'hola', options: ['hola', 'adios'] });

    const start = Date.now();
    await lessonService.getNextExercise({ userId: 1, sessionId: 5, nativeLanguageCode: 'en', targetLanguageCode: 'es' });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(200);
  });
});
