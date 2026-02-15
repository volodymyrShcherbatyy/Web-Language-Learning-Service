const db = require('../config/db');

const STATUS = {
  NEW: 'new',
  LEARNING: 'learning',
  LEARNED: 'learned'
};

const REPETITION_INTERVALS = [
  '10 minutes',
  '1 day',
  '3 days'
];

const PRIORITY_WEIGHTS = {
  USER_LIST: 50,
  OVERDUE_REPETITION: 40,
  LEARNING: 25,
  NEW: 10
};

async function tableExists(name) {
  const { rows } = await db.query('SELECT to_regclass($1) AS name', [name]);
  return Boolean(rows[0] && rows[0].name);
}

async function getCandidateConcepts(userId, limit = 40) {
  const hasUserList = await tableExists('user_vocabulary_list');

  const userListQuery = hasUserList
    ? `
      LEFT JOIN user_vocabulary_list uvl
        ON uvl.user_id = $1
        AND uvl.concept_id = c.id
    `
    : 'LEFT JOIN (SELECT NULL::BIGINT AS user_id, NULL::BIGINT AS concept_id) uvl ON 1=0';

  const query = `
    SELECT
      c.id AS concept_id,
      COALESCE(up.status, 'new') AS status,
      up.next_review_at,
      CASE WHEN uvl.concept_id IS NULL THEN FALSE ELSE TRUE END AS in_user_list,
      CASE WHEN up.next_review_at IS NOT NULL AND up.next_review_at <= NOW() THEN TRUE ELSE FALSE END AS overdue_review,
      (
        CASE WHEN uvl.concept_id IS NOT NULL THEN ${PRIORITY_WEIGHTS.USER_LIST} ELSE 0 END +
        CASE WHEN up.next_review_at IS NOT NULL AND up.next_review_at <= NOW() THEN ${PRIORITY_WEIGHTS.OVERDUE_REPETITION} ELSE 0 END +
        CASE WHEN up.status = '${STATUS.LEARNING}' THEN ${PRIORITY_WEIGHTS.LEARNING} ELSE 0 END +
        CASE WHEN up.status IS NULL OR up.status = '${STATUS.NEW}' THEN ${PRIORITY_WEIGHTS.NEW} ELSE 0 END
      ) AS priority_score
    FROM Concepts c
    LEFT JOIN User_Progress up
      ON up.user_id = $1
      AND up.concept_id = c.id
    ${userListQuery}
    ORDER BY priority_score DESC, c.id ASC
    LIMIT $2
  `;

  const { rows } = await db.query(query, [userId, limit]);
  return rows;
}

function chunkByStatus(rows) {
  return {
    newWords: rows.filter((row) => row.status === STATUS.NEW),
    reviewWords: rows.filter((row) => row.status === STATUS.LEARNING && row.overdue_review),
    reinforcementWords: rows.filter((row) => row.status === STATUS.LEARNING && !row.overdue_review)
  };
}

function pickBalancedWords(groups, totalExercises, maxNewWords) {
  const targetNew = Math.min(Math.floor(totalExercises * 0.4), maxNewWords);
  const targetReview = Math.floor(totalExercises * 0.4);
  const targetReinforcement = totalExercises - targetNew - targetReview;

  const selected = [];
  const used = new Set();

  const addFromPool = (pool, count) => {
    for (const row of pool) {
      if (selected.length >= totalExercises || count <= 0) {
        break;
      }
      if (!used.has(row.concept_id)) {
        selected.push(row);
        used.add(row.concept_id);
        count -= 1;
      }
    }
    return count;
  };

  let newRemaining = addFromPool(groups.newWords, targetNew);
  let reviewRemaining = addFromPool(groups.reviewWords, targetReview);
  let reinforcementRemaining = addFromPool(groups.reinforcementWords, targetReinforcement);

  const overflowPools = [groups.reviewWords, groups.reinforcementWords, groups.newWords];

  while (selected.length < totalExercises) {
    let added = false;
    for (const pool of overflowPools) {
      const before = selected.length;
      addFromPool(pool, totalExercises - selected.length);
      if (selected.length > before) {
        added = true;
      }
      if (selected.length >= totalExercises) {
        break;
      }
    }
    if (!added) {
      break;
    }
  }

  return {
    selected,
    composition: {
      targetNew,
      targetReview,
      targetReinforcement,
      unmet: {
        newRemaining,
        reviewRemaining,
        reinforcementRemaining
      }
    }
  };
}

function enforceUserWordConsecutiveLimit(rows, maxConsecutive = 2) {
  const prioritized = [...rows].sort((a, b) => b.priority_score - a.priority_score);
  const userListWords = prioritized.filter((row) => row.in_user_list);
  const otherWords = prioritized.filter((row) => !row.in_user_list);

  const result = [];
  let userIndex = 0;
  let otherIndex = 0;
  let consecutiveUser = 0;

  while (userIndex < userListWords.length || otherIndex < otherWords.length) {
    const canPlaceUser = userIndex < userListWords.length && consecutiveUser < maxConsecutive;

    if (canPlaceUser) {
      result.push(userListWords[userIndex]);
      userIndex += 1;
      consecutiveUser += 1;
    } else if (otherIndex < otherWords.length) {
      result.push(otherWords[otherIndex]);
      otherIndex += 1;
      consecutiveUser = 0;
    } else if (userIndex < userListWords.length) {
      result.push(userListWords[userIndex]);
      userIndex += 1;
      consecutiveUser = 0;
    }
  }

  return result;
}

module.exports = {
  STATUS,
  REPETITION_INTERVALS,
  PRIORITY_WEIGHTS,
  getCandidateConcepts,
  chunkByStatus,
  pickBalancedWords,
  enforceUserWordConsecutiveLimit
};
