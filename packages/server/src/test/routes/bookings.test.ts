import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { eq } from 'drizzle-orm'
import { createApp } from '../../app'
import { db, client } from '../../db/connection'
import { flights, bookings } from '../../db/schema'

describe('Booking Routes', () => {
  const app = createApp()
  let authToken: string
  let testFlightId: string
  let testBookingId: string

  beforeAll(async () => {
    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user', password: 'user' })

    authToken = loginResponse.body.data.token

    // Insert a test flight
    const [testFlight] = await db
      .insert(flights)
      .values({
        airline: 'Test Airlines',
        flight_number: 'BOOK123',
        departure_time: new Date('2025-01-25T10:00:00Z'),
        arrival_time: new Date('2025-01-25T14:00:00Z'),
        price: '60000',
        source: 'Tokyo (NRT)',
        destination: 'Osaka (KIX)',
        departure_date: new Date('2025-01-25'),
        arrival_date: new Date('2025-01-25'),
        is_round_trip: false,
      })
      .returning()

    testFlightId = testFlight.id
  })

  afterAll(async () => {
    // Clean up test data
    if (testBookingId) {
      await db.delete(bookings).where(eq(bookings.id, testBookingId))
    }
    await db.delete(flights).where(eq(flights.id, testFlightId))
    await client.end()
  })

  describe('Authentication Required', () => {
    it('should require authentication for all booking endpoints', async () => {
      await request(app)
        .get('/api/bookings')
        .expect(401)

      await request(app)
        .post('/api/bookings')
        .send({})
        .expect(401)
    })
  })

  describe('POST /api/bookings', () => {
    it('should create a new booking with valid data', async () => {
      const bookingData = {
        flight_id: testFlightId,
        fullname: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      }

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Booking created successfully',
        data: {
          flight_id: testFlightId,
          fullname: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      })

      testBookingId = response.body.data.id
    })

    it('should validate booking data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flight_id: testFlightId,
          fullname: 'A', // Too short
          email: 'invalid-email',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should reject booking for non-existent flight', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          flight_id: 'non-existent-flight',
          fullname: 'John Doe',
          email: 'john@example.com',
        })
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Flight not found',
      })
    })
  })

  describe('GET /api/bookings', () => {
    it('should return all bookings for authenticated user', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
      })
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/bookings/:id', () => {
    it('should return specific booking by ID', async () => {
      if (!testBookingId) return // Skip if no booking was created

      const response = await request(app)
        .get(`/api/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testBookingId,
          fullname: 'John Doe',
          email: 'john@example.com',
        },
      })
    })

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Booking not found',
      })
    })
  })

  describe('PUT /api/bookings/:id', () => {
    it('should update booking with valid data', async () => {
      if (!testBookingId) return // Skip if no booking was created

      const updateData = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
      }

      const response = await request(app)
        .put(`/api/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Booking updated successfully',
        data: {
          id: testBookingId,
          fullname: 'Jane Doe',
          email: 'jane@example.com',
        },
      })
    })
  })

  describe('DELETE /api/bookings/:id', () => {
    it('should soft delete booking', async () => {
      if (!testBookingId) return // Skip if no booking was created

      const response = await request(app)
        .delete(`/api/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Booking deleted successfully',
      })

      // Verify booking is soft deleted (not accessible)
      await request(app)
        .get(`/api/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})
