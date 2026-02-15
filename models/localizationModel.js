const db = require('../config/db');

const getLocalizationWithFallback = async (languageId, fallbackLanguageId) => {
  const query = `
    SELECT
      e.key,
      COALESCE(t.text, e.text) AS text
    FROM ui_translations e
    LEFT JOIN ui_translations t
      ON t.key = e.key
      AND t.language_id = $1
    WHERE e.language_id = $2
  `;
  const { rows } = await db.query(query, [languageId, fallbackLanguageId]);
  return rows;
};

module.exports = {
  getLocalizationWithFallback
};
