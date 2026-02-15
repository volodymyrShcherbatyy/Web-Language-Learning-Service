const db = require('../config/db');

const getLanguageById = async (id) => {
  const { rows } = await db.query('SELECT id, code, name FROM languages WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
};

const getLanguageByCode = async (code) => {
  const { rows } = await db.query('SELECT id, code, name FROM languages WHERE code = $1 LIMIT 1', [code]);
  return rows[0] || null;
};

module.exports = {
  getLanguageById,
  getLanguageByCode
};
