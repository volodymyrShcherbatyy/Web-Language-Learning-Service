const db = require('../config/db');
const { EXERCISE_TYPES } = require('./exerciseEngineService');
const {
  getCandidateConcepts,
  chunkByStatus,
  pickBalancedWords,
  enforceUserWordConsecutiveLimit
} = require('./learningFlowService');

const DEFAULT_SESSION_LENGTH = 10;
const DEFAULT_MAX_NEW_WORDS = 4;

function chooseExerciseType(orderIndex) {
  return orderIndex % 2 === 0 ? EXERCISE_TYPES.TARGET_TO_NATIVE : EXERCISE_TYPES.NATIVE_TO_TARGET;
}

async function createSession({ userId, totalExercises = DEFAULT_SESSION_LENGTH, maxNewWords = DEFAULT_MAX_NEW_WORDS }) {
  const candidateRows = await getCandidateConcepts(userId, totalExercises * 5);
  const limitedSequence = enforceUserWordConsecutiveLimit(candidateRows, 2);
  const grouped = chunkByStatus(limitedSequence);
  const { selected } = pickBalancedWords(grouped, totalExercises, maxNewWords);

  if (selected.length === 0) {
    throw new Error('No concepts available to build a session');
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      `
        INSERT INTO Learning_Sessions (user_id, total_exercises, completed_exercises, correct_answers, wrong_answers)
        VALUES ($1, $2, 0, 0, 0)
        RETURNING *
      `,
      [userId, selected.length]
    );

    const session = sessionResult.rows[0];

    for (let index = 0; index < selected.length; index += 1) {
      const concept = selected[index];
      await client.query(
        `
          INSERT INTO Session_Exercises (session_id, concept_id, exercise_type, order_index, result)
          VALUES ($1, $2, $3, $4, NULL)
        `,
        [session.id, concept.concept_id, chooseExerciseType(index), index]
      );
    }

    await client.query('COMMIT');
    return session;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  DEFAULT_SESSION_LENGTH,
  createSession
};
