module.exports = {
  // Configuración base
  verbose: true,
  testEnvironment: 'node',
  roots: ['<rootDir>/../'],
  
  // Cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    'backend/src/**/*.{js,ts}',
    'backend/controllers/**/*.{js,ts}',
    'backend/models/**/*.{js,ts}',
    'backend/services/**/*.{js,ts}',
    'backend/middleware/**/*.{js,ts}',
    'frontend/src/**/*.{js,ts,jsx,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.test.{js,ts,jsx,tsx}',
    '!**/*.spec.{js,ts,jsx,tsx}'
  ],
  coverageDirectory: 'test-suite/reports/coverage-reports',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Configuración de tests
  testMatch: [
    '**/test-suite/**/*.test.{js,ts,jsx,tsx}',
    '**/test-suite/**/*.spec.{js,ts,jsx,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // Configuración de transformación
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel/runtime)/)'
  ],

  // Configuración de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@backend/(.*)$': '<rootDir>/../backend/$1',
    '^@frontend/(.*)$': '<rootDir>/../frontend/src/$1',
    '^@test/(.*)$': '<rootDir>/$1'
  },

  // Configuración de setup
  setupFilesAfterEnv: [
    '<rootDir>/test-environment.js'
  ],

  // Configuración de timeouts
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/test-environment.js'],

  // Configuración de reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-suite/reports/test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],

  // Configuración de globals
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../tsconfig.json'
    }
  }
};