const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const hashPassword = (password) => bcrypt.hash(password, 12);

const comparePassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);

const signToken = (user) =>
  jwt.sign(
    {
      user_id: user.id,
      role: user.role
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

module.exports = {
  hashPassword,
  comparePassword,
  signToken
};
