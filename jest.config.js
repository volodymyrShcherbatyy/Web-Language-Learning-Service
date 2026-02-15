module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'src/controllers/**/*.js',
    'src/services/**/*.js',
    '!**/node_modules/**'
  ]
};
