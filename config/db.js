const { Pool } = require('pg');
const config = require('./env');

const pool = config.db.connectionString
  ? new Pool({ connectionString: config.db.connectionString })
  : new Pool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
