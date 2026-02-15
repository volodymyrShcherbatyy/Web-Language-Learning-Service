const jwt = require('jsonwebtoken');

function makeToken(payload = { id: 1, role: 'user' }, secret = 'test-secret', expiresIn = '1h') {
  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = { makeToken };
