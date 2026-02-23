/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      coverageThreshold: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/tests/integration/envSetup.ts'],
      maxWorkers: 1,
    },
  ],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/docs/**'],
}

module.exports = config
