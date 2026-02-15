const db = require('../config/db');

const addTranslation = async ({ conceptId, languageId, text }) => {
  const query = `
    INSERT INTO translations (concept_id, language_id, text)
    VALUES ($1, $2, $3)
    RETURNING id, concept_id, language_id, text
  `;
  const { rows } = await db.query(query, [conceptId, languageId, text]);
  return rows[0];
};

module.exports = {
  addTranslation
};
