module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/server/__tests__/setup.ts'],
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/__tests__/**',
    '!server/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}; 