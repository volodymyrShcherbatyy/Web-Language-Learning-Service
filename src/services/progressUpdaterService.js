const db = require('../config/db');
const { STATUS, REPETITION_INTERVALS } = require('./learningFlowService');

function computeNextInterval(correctAnswers) {
  if (correctAnswers <= 1) return REPETITION_INTERVALS[0];
  if (correctAnswers === 2) return REPETITION_INTERVALS[1];
  return REPETITION_INTERVALS[2];
}

function computeStatus({ currentStatus, correctAnswers, wrongAnswers }) {
  if (currentStatus === STATUS.NEW) {
    return STATUS.LEARNING;
  }

  if (currentStatus === STATUS.LEARNING && correctAnswers >= 3 && wrongAnswers <= 1) {
    return STATUS.LEARNED;
  }

  return currentStatus;
}

async function updateUserProgress({ userId, conceptId, isCorrect, client }) {
  const executor = client || db;

  const existingResult = await executor.query(
    'SELECT * FROM User_Progress WHERE user_id = $1 AND concept_id = $2 FOR UPDATE',
    [userId, conceptId]
  );

  const existing = existingResult.rows[0];

  if (!existing) {
    const initialCorrect = isCorrect ? 1 : 0;
    const initialWrong = isCorrect ? 0 : 1;
    const nextInterval = computeNextInterval(initialCorrect);

    const inserted = await executor.query(
      `
        INSERT INTO User_Progress (
          user_id, concept_id, status, correct_answers, wrong_answers,
          last_seen_at, next_review_at, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          NOW(), NOW() + $6::interval, NOW(), NOW()
        )
        RETURNING *
      `,
      [userId, conceptId, STATUS.LEARNING, initialCorrect, initialWrong, nextInterval]
    );

    return inserted.rows[0];
  }

  const correctAnswers = existing.correct_answers + (isCorrect ? 1 : 0);
  const wrongAnswers = existing.wrong_answers + (isCorrect ? 0 : 1);
  const status = computeStatus({
    currentStatus: existing.status,
    correctAnswers,
    wrongAnswers
  });
  const nextInterval = computeNextInterval(correctAnswers);

  const updated = await executor.query(
    `
      UPDATE User_Progress
      SET
        status = $3,
        correct_answers = $4,
        wrong_answers = $5,
        last_seen_at = NOW(),
        next_review_at = NOW() + $6::interval,
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [existing.id, userId, status, correctAnswers, wrongAnswers, nextInterval]
  );

  return updated.rows[0];
}

module.exports = {
  updateUserProgress
};
