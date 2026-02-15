const db = require('../config/db');

const getAllConcepts = async () => {
  const query = `
    SELECT
      c.id,
      c.type,
      c.difficulty_level,
      c.created_at,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', t.id,
          'language_id', t.language_id,
          'text', t.text
        )) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS translations,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', m.id,
          'type', m.type,
          'file_url', m.file_url
        )) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media
    FROM concepts c
    LEFT JOIN translations t ON t.concept_id = c.id
    LEFT JOIN media m ON m.concept_id = c.id
    GROUP BY c.id
    ORDER BY c.id ASC
  `;
  const { rows } = await db.query(query);
  return rows;
};

const getConceptById = async (id) => {
  const query = `
    SELECT
      c.id,
      c.type,
      c.difficulty_level,
      c.created_at,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', t.id,
          'language_id', t.language_id,
          'text', t.text
        )) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS translations,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', m.id,
          'type', m.type,
          'file_url', m.file_url
        )) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media
    FROM concepts c
    LEFT JOIN translations t ON t.concept_id = c.id
    LEFT JOIN media m ON m.concept_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
    LIMIT 1
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
};

const createConcept = async ({ type, difficultyLevel = null }) => {
  const query = `
    INSERT INTO concepts (type, difficulty_level)
    VALUES ($1, $2)
    RETURNING id, type, difficulty_level, created_at
  `;
  const { rows } = await db.query(query, [type, difficultyLevel]);
  return rows[0];
};

module.exports = {
  getAllConcepts,
  getConceptById,
  createConcept
};
