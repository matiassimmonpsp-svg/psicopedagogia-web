import '@testing-library/jest-dom/vitest'

// JWT_SECRET must be set before auth module loads (validates min 32 chars)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long-for-validation'
}
