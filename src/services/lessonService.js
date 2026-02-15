const db = require('../config/db');
const { createSession } = require('./sessionBuilderService');
const { generateExercise } = require('./exerciseEngineService');
const { updateUserProgress } = require('./progressUpdaterService');

async function assertSessionOwnership(sessionId, userId) {
  const { rows } = await db.query(
    'SELECT * FROM Learning_Sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  if (!rows[0]) {
    const error = new Error('Session not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
}

async function startLesson({ userId, totalExercises, maxNewWords }) {
  return createSession({ userId, totalExercises, maxNewWords });
}

async function getNextExercise({ userId, sessionId, nativeLanguageCode, targetLanguageCode }) {
  const session = await assertSessionOwnership(sessionId, userId);

  const pendingExerciseResult = await db.query(
    `
      SELECT *
      FROM Session_Exercises
      WHERE session_id = $1
        AND result IS NULL
      ORDER BY order_index ASC
      LIMIT 1
    `,
    [session.id]
  );

  const pendingExercise = pendingExerciseResult.rows[0];

  if (!pendingExercise) {
    return {
      done: true,
      session_progress: {
        total_exercises: session.total_exercises,
        completed_exercises: session.completed_exercises,
        correct_answers: session.correct_answers,
        wrong_answers: session.wrong_answers
      }
    };
  }

  const exercise = await generateExercise({
    conceptId: pendingExercise.concept_id,
    nativeLanguageCode,
    targetLanguageCode,
    forcedType: pendingExercise.exercise_type
  });

  return {
    done: false,
    exercise: {
      id: pendingExercise.id,
      ...exercise
    },
    session_progress: {
      total_exercises: session.total_exercises,
      completed_exercises: session.completed_exercises,
      correct_answers: session.correct_answers,
      wrong_answers: session.wrong_answers
    }
  };
}

async function submitAnswer({ userId, sessionId, exerciseId, answer, nativeLanguageCode, targetLanguageCode }) {
  const session = await assertSessionOwnership(sessionId, userId);

  const exerciseResult = await db.query(
    `
      SELECT *
      FROM Session_Exercises
      WHERE id = $1
        AND session_id = $2
    `,
    [exerciseId, session.id]
  );

  const sessionExercise = exerciseResult.rows[0];
  if (!sessionExercise) {
    const error = new Error('Exercise not found in session');
    error.status = 404;
    throw error;
  }

  if (sessionExercise.result !== null) {
    const error = new Error('Exercise already answered');
    error.status = 409;
    throw error;
  }

  const builtExercise = await generateExercise({
    conceptId: sessionExercise.concept_id,
    nativeLanguageCode,
    targetLanguageCode,
    forcedType: sessionExercise.exercise_type
  });

  const isCorrect = String(answer).trim() === String(builtExercise.correct_answer).trim();

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    await client.query(
      `
        INSERT INTO Exercises_Log (user_id, concept_id, exercise_type, is_correct, session_id, answered_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [userId, sessionExercise.concept_id, sessionExercise.exercise_type, isCorrect, session.id]
    );

    const progress = await updateUserProgress({
      userId,
      conceptId: sessionExercise.concept_id,
      isCorrect,
      client
    });

    await client.query(
      `
        UPDATE Session_Exercises
        SET result = $3
        WHERE id = $1
          AND session_id = $2
      `,
      [sessionExercise.id, session.id, isCorrect ? 'correct' : 'wrong']
    );

    const sessionUpdateResult = await client.query(
      `
        UPDATE Learning_Sessions
        SET
          completed_exercises = completed_exercises + 1,
          correct_answers = correct_answers + $2,
          wrong_answers = wrong_answers + $3,
          finished_at = CASE
            WHEN completed_exercises + 1 >= total_exercises THEN NOW()
            ELSE finished_at
          END
        WHERE id = $1
        RETURNING *
      `,
      [session.id, isCorrect ? 1 : 0, isCorrect ? 0 : 1]
    );

    await client.query('COMMIT');

    const updatedSession = sessionUpdateResult.rows[0];
    const nextExercise = await getNextExercise({
      userId,
      sessionId,
      nativeLanguageCode,
      targetLanguageCode
    });

    return {
      is_correct: isCorrect,
      correct_answer: builtExercise.correct_answer,
      progress,
      session_progress: {
        total_exercises: updatedSession.total_exercises,
        completed_exercises: updatedSession.completed_exercises,
        correct_answers: updatedSession.correct_answers,
        wrong_answers: updatedSession.wrong_answers
      },
      next: nextExercise
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getLessonSummary({ userId, sessionId }) {
  const session = await assertSessionOwnership(sessionId, userId);

  const learnedWordsResult = await db.query(
    `
      SELECT COUNT(*)::int AS learned_words
      FROM User_Progress
      WHERE user_id = $1
        AND status = 'learned'
        AND concept_id IN (
          SELECT concept_id
          FROM Session_Exercises
          WHERE session_id = $2
        )
    `,
    [userId, sessionId]
  );

  const mistakesResult = await db.query(
    `
      SELECT se.concept_id, COUNT(*)::int AS wrong_count
      FROM Session_Exercises se
      WHERE se.session_id = $1
        AND se.result = 'wrong'
      GROUP BY se.concept_id
      ORDER BY wrong_count DESC
    `,
    [sessionId]
  );

  const attempted = session.correct_answers + session.wrong_answers;
  const accuracy = attempted === 0 ? 0 : Number(((session.correct_answers / attempted) * 100).toFixed(2));

  return {
    session_id: session.id,
    accuracy,
    learned_words: learnedWordsResult.rows[0].learned_words,
    mistakes: mistakesResult.rows
  };
}

module.exports = {
  startLesson,
  getNextExercise,
  submitAnswer,
  getLessonSummary
};
