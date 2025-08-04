import { Router } from 'express'
import { z } from 'zod'
import { eq, and, gte, lte, isNull, desc, asc, sql, count } from 'drizzle-orm'
import { validateRequest } from '../middleware/validation'
import { db } from '../db/connection'
import { flights } from '../db/schema'
import { ApiError } from '../middleware/error-handler'
import { logger } from '../utils/logger'

const router = Router()

// Flight search query schema
const flightSearchSchema = z.object({
  source: z.string().optional(),
  destination: z.string().optional(),
  departure_date: z.string().optional(),
  return_date: z.string().optional(),
  is_round_trip: z.string().transform(val => val === 'true').optional(),
  sort_by: z.enum(['price', 'departure_time', 'arrival_time']).optional().default('departure_time'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
})

// Flight ID params schema
const flightParamsSchema = z.object({
  id: z.string().min(1, 'Flight ID is required'),
})

// GET /flights - Search flights with pagination and sorting
router.get('/', validateRequest({ query: flightSearchSchema }), async (req, res, next) => {
  try {
    const {
      source,
      destination,
      departure_date,
      return_date,
      is_round_trip,
      sort_by,
      sort_order,
      page,
      limit,
    } = req.query

    // Build where conditions
    const conditions = [isNull(flights.deleted_at)]

    if (source) {
      conditions.push(sql`LOWER(${flights.source}) LIKE LOWER(${'%' + source + '%'})`)
    }

    if (destination) {
      conditions.push(sql`LOWER(${flights.destination}) LIKE LOWER(${'%' + destination + '%'})`)
    }

    if (departure_date) {
      const date = new Date(departure_date)
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)
      conditions.push(
        and(
          gte(flights.departure_date, date),
          lte(flights.departure_date, nextDay)
        )
      )
    }

    if (is_round_trip !== undefined) {
      conditions.push(eq(flights.is_round_trip, is_round_trip))
    }

    // Build order by clause
    const orderColumn = flights[sort_by as keyof typeof flights]
    const orderDirection = sort_order === 'desc' ? desc(orderColumn) : asc(orderColumn)

    // Calculate offset
    const offset = (page - 1) * limit

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(flights)
      .where(and(...conditions))

    const total = totalResult.count

    // Get flights with pagination
    const flightResults = await db
      .select()
      .from(flights)
      .where(and(...conditions))
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset)

    const totalPages = Math.ceil(total / limit)

    logger.info('Flight search performed', {
      filters: { source, destination, departure_date, is_round_trip },
      pagination: { page, limit, total, totalPages },
      resultsCount: flightResults.length,
    })

    res.json({
      success: true,
      data: {
        flights: flightResults,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /flights/:id - Get specific flight by ID
router.get('/:id', validateRequest({ params: flightParamsSchema }), async (req, res, next) => {
  try {
    const { id } = req.params

    const flight = await db
      .select()
      .from(flights)
      .where(and(eq(flights.id, id), isNull(flights.deleted_at)))
      .limit(1)

    if (flight.length === 0) {
      throw new ApiError('Flight not found', 404)
    }

    logger.info('Flight retrieved', { flightId: id })

    res.json({
      success: true,
      data: flight[0],
    })
  } catch (error) {
    next(error)
  }
})

export default router
