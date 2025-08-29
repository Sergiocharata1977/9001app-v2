/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setupTests.ts'],
    css: true,
    include: ['src/**/*.integration.{test,spec}.{ts,tsx}', 'src/tests/integration/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'build',
      'cypress',
      'src/**/*.{test,spec}.{ts,tsx}' // Exclude unit tests
    ],
    testTimeout: 30000, // Longer timeout for integration tests
    hookTimeout: 15000,
    teardownTimeout: 10000,
    // Configuración específica para integration tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Run integration tests sequentially
        isolate: true
      }
    },
    // Reportes específicos
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './coverage/integration-results.json'
    },
    // Coverage específico para integration tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'dist/',
        'build/',
        'coverage/',
        '**/*.stories.{ts,tsx}',
        'src/assets/',
        'public/',
        'cypress/'
      ]
    },
    // Configuración de entorno para integration tests
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3001',
      VITE_APP_ENV: 'test'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})