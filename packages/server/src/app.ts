import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { errorHandler, notFoundHandler } from './middleware/error-handler'
import { logger } from './utils/logger'
import { isDevelopment } from './config/env'
import apiRoutes from './routes'

export function createApp() {
  const app = express()

  // Security middleware
  app.use(helmet())
  
  // CORS configuration
  app.use(cors({
    origin: isDevelopment ? ['http://localhost:5173', 'http://localhost:3000'] : false,
    credentials: true,
  }))

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 1000 : 100, // Limit each IP to 100 requests per windowMs in production
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use(limiter)

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Compression middleware
  app.use(compression())

  // Logging middleware
  if (isDevelopment) {
    app.use(morgan('dev'))
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }))
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  })

  // API routes
  app.use('/api', apiRoutes)

  // 404 handler
  app.use(notFoundHandler)

  // Error handling middleware (must be last)
  app.use(errorHandler)

  return app
}
