const express = require('express');
const { withTransaction, query } = require('../db');
const { requireAuth } = require('../middleware/auth');
const {
  buildSessionExercises,
  DEFAULT_SESSION_SIZE,
  nextStatusAfterAnswer,
  computeNextReviewAt
} = require('../services/learningEngine');

const router = express.Router();

router.post('/sessions', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const requestedSize = Number(req.body.totalExercises) || DEFAULT_SESSION_SIZE;

  try {
    const result = await withTransaction(async (client) => {
      const progressRows = await client.query(
        `SELECT id, concept_id, status, correct_answers, wrong_answers, next_review_at
         FROM user_progress
         WHERE user_id = $1
         ORDER BY updated_at ASC`,
        [userId]
      );

      const exercises = buildSessionExercises(progressRows.rows, requestedSize);

      const sessionInsert = await client.query(
        `INSERT INTO learning_sessions (
           user_id, total_exercises, completed_exercises, correct_answers, wrong_answers, started_at
         ) VALUES ($1, $2, 0, 0, 0, NOW()) RETURNING *`,
        [userId, exercises.length]
      );

      const session = sessionInsert.rows[0];

      for (const exercise of exercises) {
        await client.query(
          `INSERT INTO session_exercises (session_id, concept_id, exercise_type, order_index, result)
           VALUES ($1, $2, $3, $4, NULL)`,
          [session.id, exercise.conceptId, exercise.exerciseType, exercise.orderIndex]
        );
      }

      const sessionExercises = await client.query(
        `SELECT id, concept_id, exercise_type, order_index, result
         FROM session_exercises WHERE session_id = $1 ORDER BY order_index ASC`,
        [session.id]
      );

      return {
        session,
        exercises: sessionExercises.rows
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create learning session', detail: error.message });
  }
});

router.get('/sessions/:sessionId', requireAuth, async (req, res) => {
  const sessionId = Number(req.params.sessionId);

  try {
    const sessionResult = await query(
      `SELECT * FROM learning_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.id]
    );

    if (!sessionResult.rowCount) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const exercisesResult = await query(
      `SELECT id, concept_id, exercise_type, order_index, result
       FROM session_exercises WHERE session_id = $1 ORDER BY order_index ASC`,
      [sessionId]
    );

    return res.json({
      session: sessionResult.rows[0],
      exercises: exercisesResult.rows
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch session', detail: error.message });
  }
});

router.post('/sessions/:sessionId/answers', requireAuth, async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const { sessionExerciseId, isCorrect } = req.body;

  if (typeof isCorrect !== 'boolean' || !sessionExerciseId) {
    return res.status(400).json({ message: 'sessionExerciseId and boolean isCorrect are required' });
  }

  try {
    const result = await withTransaction(async (client) => {
      const sessionRow = await client.query(
        `SELECT * FROM learning_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE`,
        [sessionId, req.user.id]
      );

      if (!sessionRow.rowCount) {
        return { status: 404, body: { message: 'Session not found' } };
      }

      const exerciseRow = await client.query(
        `SELECT * FROM session_exercises WHERE id = $1 AND session_id = $2 FOR UPDATE`,
        [sessionExerciseId, sessionId]
      );

      if (!exerciseRow.rowCount) {
        return { status: 404, body: { message: 'Session exercise not found' } };
      }

      const exercise = exerciseRow.rows[0];
      const answerResult = isCorrect ? 'correct' : 'wrong';

      await client.query(
        `UPDATE session_exercises SET result = $1 WHERE id = $2`,
        [answerResult, sessionExerciseId]
      );

      await client.query(
        `INSERT INTO exercises_log (user_id, concept_id, exercise_type, is_correct, session_id, answered_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [req.user.id, exercise.concept_id, exercise.exercise_type, isCorrect, sessionId]
      );

      const progressRow = await client.query(
        `SELECT * FROM user_progress WHERE user_id = $1 AND concept_id = $2 FOR UPDATE`,
        [req.user.id, exercise.concept_id]
      );

      if (!progressRow.rowCount) {
        await client.query(
          `INSERT INTO user_progress (
             user_id, concept_id, status, correct_answers, wrong_answers, last_seen_at, next_review_at, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW(), NOW())`,
          [
            req.user.id,
            exercise.concept_id,
            isCorrect ? 'learning' : 'new',
            isCorrect ? 1 : 0,
            isCorrect ? 0 : 1,
            computeNextReviewAt('new', isCorrect)
          ]
        );
      } else {
        const progress = progressRow.rows[0];
        const nextStatus = nextStatusAfterAnswer(progress.status, isCorrect);
        const nextReviewAt = computeNextReviewAt(progress.status, isCorrect);

        await client.query(
          `UPDATE user_progress
           SET status = $1,
               correct_answers = correct_answers + $2,
               wrong_answers = wrong_answers + $3,
               last_seen_at = NOW(),
               next_review_at = $4,
               updated_at = NOW()
           WHERE id = $5`,
          [nextStatus, isCorrect ? 1 : 0, isCorrect ? 0 : 1, nextReviewAt, progress.id]
        );
      }

      const session = sessionRow.rows[0];
      const completed = session.completed_exercises + 1;
      const correct = session.correct_answers + (isCorrect ? 1 : 0);
      const wrong = session.wrong_answers + (isCorrect ? 0 : 1);
      const finishedAt = completed >= session.total_exercises ? new Date() : null;

      const sessionUpdate = await client.query(
        `UPDATE learning_sessions
         SET completed_exercises = $1,
             correct_answers = $2,
             wrong_answers = $3,
             finished_at = COALESCE($4, finished_at)
         WHERE id = $5
         RETURNING *`,
        [completed, correct, wrong, finishedAt, sessionId]
      );

      return { status: 200, body: { session: sessionUpdate.rows[0] } };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit answer', detail: error.message });
  }
});

module.exports = router;
