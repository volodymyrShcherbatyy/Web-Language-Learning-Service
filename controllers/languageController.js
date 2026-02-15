const db = require('../config/db');

const getLanguages = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, code, name FROM languages ORDER BY name');
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getLanguages
};
