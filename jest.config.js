/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '\\.(ttf|otf|woff2?|png|jpe?g|gif|webp|svg|mp4|lottie)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'constants/**/*.ts',
    'contexts/**/*.tsx',
    'hooks/**/*.ts',
    'models/**/*.tsx',
    'utils/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 99,
      functions: 99,
      lines: 99,
      statements: 99,
    },
  },
};
