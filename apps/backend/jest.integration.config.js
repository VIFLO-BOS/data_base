module.exports = {
  ...require('./jest.config'),
  rootDir: '.',
  testRegex: 'test/.*\\.integration\\.ts$',
  setupFiles: ['<rootDir>/test/environment.cjs'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testTimeout: 30000,
};
