import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateToken, verifyToken } from '../../utils/jwt'

describe('JWT Utils', () => {
  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv('JWT_SECRET', 'test-secret')
    vi.stubEnv('JWT_EXPIRES_IN', '1h')
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const username = 'testuser'
      const token = generateToken(username)

      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1')
      const token2 = generateToken('user2')

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const username = 'testuser'
      const token = generateToken(username)
      
      const payload = verifyToken(token)

      expect(payload.username).toBe(username)
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
    })

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here')
      }).toThrow('Invalid token')
    })

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyToken('not-a-jwt-token')
      }).toThrow('Invalid token')
    })

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('')
      }).toThrow('Invalid token')
    })
  })
})
