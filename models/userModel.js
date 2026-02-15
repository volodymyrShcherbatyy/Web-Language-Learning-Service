const db = require('../config/db');

const createUser = async ({ email, passwordHash, role = 'user' }) => {
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, native_language_id, learning_language_id, interface_language_id
  `;
  const { rows } = await db.query(query, [email, passwordHash, role]);
  return rows[0];
};

const getUserByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
};

const getUserProfileById = async (id) => {
  const query = `
    SELECT
      u.id,
      u.email,
      ln.id AS native_language_id,
      ln.code AS native_language_code,
      ln.name AS native_language_name,
      ll.id AS learning_language_id,
      ll.code AS learning_language_code,
      ll.name AS learning_language_name,
      li.id AS interface_language_id,
      li.code AS interface_language_code,
      li.name AS interface_language_name
    FROM users u
    LEFT JOIN languages ln ON u.native_language_id = ln.id
    LEFT JOIN languages ll ON u.learning_language_id = ll.id
    LEFT JOIN languages li ON u.interface_language_id = li.id
    WHERE u.id = $1
    LIMIT 1
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
};

const updateUserLanguages = async ({ userId, nativeLanguageId, learningLanguageId, interfaceLanguageId }) => {
  const query = `
    UPDATE users
    SET native_language_id = $1,
        learning_language_id = $2,
        interface_language_id = $3,
        updated_at = NOW()
    WHERE id = $4
    RETURNING id
  `;
  const { rows } = await db.query(query, [nativeLanguageId, learningLanguageId, interfaceLanguageId, userId]);
  return rows[0] || null;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserProfileById,
  updateUserLanguages
};
