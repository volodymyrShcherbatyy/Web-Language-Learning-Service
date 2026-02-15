jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getClient: jest.fn()
}));

const db = require('../../src/config/db');
const lessonService = require('../../src/services/lessonService');

describe('Lesson summary calculations and data integrity', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calculates accuracy and mistake counts correctly', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 9, correct_answers: 8, wrong_answers: 2 }] })
      .mockResolvedValueOnce({ rows: [{ learned_words: 4 }] })
      .mockResolvedValueOnce({ rows: [{ concept_id: 3, wrong_count: 2 }] });

    const result = await lessonService.getLessonSummary({ userId: 1, sessionId: 9 });

    expect(result.accuracy).toBe(80);
    expect(result.learned_words).toBe(4);
    expect(result.mistakes[0].wrong_count).toBe(2);
  });
});
