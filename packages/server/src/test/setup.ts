import { beforeAll, afterAll } from 'vitest'

// Set test environment
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://mogita:mogita@localhost:5432/flight_booking_test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.PORT = '3001'

beforeAll(async () => {
  // Setup test database or mock services if needed
  console.log('Setting up test environment...')
})

afterAll(async () => {
  // Cleanup test database or mock services if needed
  console.log('Cleaning up test environment...')
})
