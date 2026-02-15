const db = require('../config/db');

const EXERCISE_TYPES = {
  TARGET_TO_NATIVE: 'target_to_native',
  NATIVE_TO_TARGET: 'native_to_target'
};

async function getConceptTranslation(conceptId, nativeLanguageCode, targetLanguageCode) {
  const query = `
    SELECT
      c.id AS concept_id,
      native_t.text AS native_text,
      target_t.text AS target_text
    FROM Concepts c
    JOIN Concept_Translations native_t
      ON native_t.concept_id = c.id
      AND native_t.language_code = $2
    JOIN Concept_Translations target_t
      ON target_t.concept_id = c.id
      AND target_t.language_code = $3
    WHERE c.id = $1
  `;

  const { rows } = await db.query(query, [conceptId, nativeLanguageCode, targetLanguageCode]);
  return rows[0] || null;
}

async function getDistractors({ conceptId, languageCode, limit = 3 }) {
  const query = `
    SELECT ct.text
    FROM Concept_Translations ct
    WHERE ct.language_code = $1
      AND ct.concept_id <> $2
    ORDER BY RANDOM()
    LIMIT $3
  `;

  const { rows } = await db.query(query, [languageCode, conceptId, limit]);
  return rows.map((row) => row.text);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function generateExercise({ conceptId, nativeLanguageCode, targetLanguageCode, forcedType }) {
  const concept = await getConceptTranslation(conceptId, nativeLanguageCode, targetLanguageCode);
  if (!concept) {
    throw new Error(`Concept ${conceptId} translation pair not found`);
  }

  const exerciseType = forcedType || (Math.random() > 0.5 ? EXERCISE_TYPES.TARGET_TO_NATIVE : EXERCISE_TYPES.NATIVE_TO_TARGET);
  const promptText = exerciseType === EXERCISE_TYPES.TARGET_TO_NATIVE ? concept.target_text : concept.native_text;
  const correctAnswer = exerciseType === EXERCISE_TYPES.TARGET_TO_NATIVE ? concept.native_text : concept.target_text;
  const distractorLanguage = exerciseType === EXERCISE_TYPES.TARGET_TO_NATIVE ? nativeLanguageCode : targetLanguageCode;

  const distractors = await getDistractors({ conceptId, languageCode: distractorLanguage, limit: 3 });
  const choices = shuffle([correctAnswer, ...distractors]).slice(0, 4);

  return {
    concept_id: concept.concept_id,
    exercise_type: exerciseType,
    prompt: promptText,
    choices,
    correct_answer: correctAnswer
  };
}

module.exports = {
  EXERCISE_TYPES,
  generateExercise
};
