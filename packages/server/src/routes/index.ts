import { Router } from 'express'
import authRoutes from './auth'
import flightRoutes from './flights'
import bookingRoutes from './bookings'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/flights', flightRoutes)
router.use('/bookings', bookingRoutes)

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Flight Booking API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      flights: '/api/flights',
      bookings: '/api/bookings',
    },
  })
})

export default router
