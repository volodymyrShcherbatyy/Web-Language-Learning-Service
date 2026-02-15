const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'lesson-secret';

jest.mock('../../src/services/lessonService', () => ({
  startLesson: jest.fn(),
  getNextExercise: jest.fn(),
  submitAnswer: jest.fn(),
  getLessonSummary: jest.fn()
}));

const lessonService = require('../../src/services/lessonService');
const lessonRoutes = require('../../src/routes/lessonRoutes');

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api', lessonRoutes);
  a.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));
  return a;
}

describe('Lesson session APIs', () => {
  const token = jwt.sign({ id: 42, email: 'qa@test.dev' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => jest.clearAllMocks());

  test('creates session with exercise count', async () => {
    lessonService.startLesson.mockResolvedValue({ id: 7, total_exercises: 10 });

    const res = await request(app())
      .post('/api/lesson/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ total_exercises: 10, max_new_words: 3 });

    expect(res.status).toBe(201);
    expect(res.body.session.total_exercises).toBe(10);
  });

  test('returns exercise flow and summary availability when done', async () => {
    lessonService.getNextExercise
      .mockResolvedValueOnce({ done: false, exercise: { id: 1, options: ['a', 'b'], media: { type: 'image' } } })
      .mockResolvedValueOnce({ done: true, session_progress: { completed_exercises: 10, total_exercises: 10 } });

    const first = await request(app()).get('/api/lesson/next?session_id=7').set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.exercise.options).toHaveLength(2);

    const second = await request(app()).get('/api/lesson/next?session_id=7').set('Authorization', `Bearer ${token}`);
    expect(second.body.done).toBe(true);
  });

  test('logs correct and wrong answers with progress updates', async () => {
    lessonService.submitAnswer
      .mockResolvedValueOnce({ is_correct: true, progress: { status: 'learning', total_correct: 1 } })
      .mockResolvedValueOnce({ is_correct: false, progress: { status: 'learning', total_wrong: 1 } });

    const good = await request(app())
      .post('/api/lesson/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: 7, exercise_id: 1, answer: 'hola' });

    const bad = await request(app())
      .post('/api/lesson/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: 7, exercise_id: 2, answer: 'wrong' });

    expect(good.body.is_correct).toBe(true);
    expect(bad.body.is_correct).toBe(false);
  });

  test('rejects expired token', async () => {
    const expired = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
    const res = await request(app()).get('/api/lesson/next?session_id=2').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});
