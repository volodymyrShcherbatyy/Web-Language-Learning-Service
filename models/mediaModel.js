const db = require('../config/db');

const addMedia = async ({ conceptId, type, fileUrl }) => {
  const query = `
    INSERT INTO media (concept_id, type, file_url)
    VALUES ($1, $2, $3)
    RETURNING id, concept_id, type, file_url
  `;
  const { rows } = await db.query(query, [conceptId, type, fileUrl]);
  return rows[0];
};

module.exports = {
  addMedia
};
