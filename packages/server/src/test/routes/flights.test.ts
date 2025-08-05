import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { eq } from 'drizzle-orm'
import { createApp } from '../../app'
import { db, client } from '../../db/connection'
import { flights } from '../../db/schema'

describe('Flight Routes', () => {
  const app = createApp()
  let testFlightId: string

  beforeAll(async () => {
    // Insert a test flight
    const [testFlight] = await db
      .insert(flights)
      .values({
        airline: 'Test Airlines',
        flight_number: 'TEST123',
        departure_time: new Date('2025-01-20T10:00:00Z'),
        arrival_time: new Date('2025-01-20T14:00:00Z'),
        price: '50000',
        source: 'Tokyo (NRT)',
        destination: 'Osaka (KIX)',
        departure_date: new Date('2025-01-20'),
        arrival_date: new Date('2025-01-20'),
        is_round_trip: false,
      })
      .returning()

    testFlightId = testFlight.id
  })

  afterAll(async () => {
    // Clean up test data
    await db.delete(flights).where(eq(flights.id, testFlightId))
    await client.end()
  })

  describe('GET /api/flights', () => {
    it('should return flights with default pagination', async () => {
      const response = await request(app)
        .get('/api/flights')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          pagination: {
            page: 1,
            limit: 5,
          },
        },
      })
      expect(Array.isArray(response.body.data.flights)).toBe(true)
      expect(response.body.data.pagination.total).toBeGreaterThan(0)
    })

    it('should filter flights by source', async () => {
      const response = await request(app)
        .get('/api/flights?source=Tokyo')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data.flights)).toBe(true)
      
      // All flights should contain "Tokyo" in source
      response.body.data.flights.forEach((flight: any) => {
        expect(flight.source.toLowerCase()).toContain('tokyo')
      })
    })

    it('should sort flights by price', async () => {
      const response = await request(app)
        .get('/api/flights?sort_by=price_asc')
        .expect(200)

      expect(response.body.success).toBe(true)
      const flights = response.body.data.flights

      if (flights.length > 1) {
        for (let i = 1; i < flights.length; i++) {
          expect(parseFloat(flights[i].price)).toBeGreaterThanOrEqual(parseFloat(flights[i-1].price))
        }
      }
    })

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/flights?page=1&limit=2')
        .expect(200)

      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
      })
      expect(response.body.data.flights.length).toBeLessThanOrEqual(2)
    })
  })

  describe('GET /api/flights/:id', () => {
    it('should return specific flight by ID', async () => {
      const response = await request(app)
        .get(`/api/flights/${testFlightId}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: testFlightId,
          airline: 'Test Airlines',
          flight_number: 'TEST123',
        },
      })
    })

    it('should return 404 for non-existent flight', async () => {
      const response = await request(app)
        .get('/api/flights/non-existent-id')
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Flight not found',
      })
    })
  })
})
