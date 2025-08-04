import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'

describe('Express App', () => {
  const app = createApp()

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Server is healthy',
        environment: 'test',
      })
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Not Found',
        message: 'Route GET /non-existent-route not found',
      })
    })
  })

  describe('Middleware', () => {
    it('should handle JSON requests', async () => {
      const response = await request(app)
        .post('/health')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json')
        .expect(404) // Health endpoint only accepts GET

      expect(response.body.success).toBe(false)
    })

    it('should set security headers', async () => {
      const response = await request(app)
        .get('/health')

      // Check for helmet security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
    })
  })
})
