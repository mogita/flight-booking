import { DEFAULT_PAGE_SIZE } from "@flight-booking/shared"
import { and, asc, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm"
import { Router } from "express"
import { z } from "zod"
import { db } from "../db/connection"
import { flights } from "../db/schema"
import { ApiError } from "../middleware/error-handler"
import { validateRequest } from "../middleware/validation"
import { logger } from "../utils/logger"

const router = Router()

// Flight search query schema
const flightSearchSchema = z.object({
	source: z.string().optional(),
	destination: z.string().optional(),
	departure_date: z.string().optional(),
	return_date: z.string().optional(),
	is_round_trip: z
		.string()
		.transform((val) => val === "true")
		.optional(),
	sort_by: z
		.enum([
			"price_asc",
			"price_desc",
			"departure_asc",
			"departure_desc",
			"duration_asc",
		])
		.optional()
		.default("price_asc"),
	page: z.string().transform(Number).optional().default("1"),
	limit: z
		.string()
		.transform(Number)
		.optional()
		.default(String(DEFAULT_PAGE_SIZE)),
})

// Flight ID params schema
const flightParamsSchema = z.object({
	id: z.string().min(1, "Flight ID is required"),
})

// GET /flights - Search flights with pagination and sorting
router.get(
	"/",
	validateRequest({ query: flightSearchSchema }),
	async (req, res, next) => {
		try {
			const {
				source,
				destination,
				departure_date,
				return_date,
				is_round_trip,
				sort_by,
				page,
				limit,
			} = req.query

			// For round trip searches, we need to find outbound flights only
			// The return flights will be searched separately by the frontend
			const conditions = [isNull(flights.deleted_at)]

			if (source) {
				conditions.push(
					sql`LOWER(${flights.source}) LIKE LOWER(${"%" + source + "%"})`,
				)
			}

			if (destination) {
				conditions.push(
					sql`LOWER(${flights.destination}) LIKE LOWER(${"%" + destination + "%"})`,
				)
			}

			if (departure_date) {
				const date = new Date(departure_date)
				const nextDay = new Date(date)
				nextDay.setDate(date.getDate() + 1)
				conditions.push(
					and(
						gte(flights.departure_date, date),
						lte(flights.departure_date, nextDay),
					),
				)
			}

			// Always search for one-way flights (is_round_trip: false)
			// Round trip is handled by combining two one-way flights
			conditions.push(eq(flights.is_round_trip, false))

			// Build order by clause based on sort_by option
			let orderClause
			switch (sort_by) {
				case "price_asc":
					orderClause = asc(flights.price)
					break
				case "price_desc":
					orderClause = desc(flights.price)
					break
				case "departure_asc":
					orderClause = asc(flights.departure_time)
					break
				case "departure_desc":
					orderClause = desc(flights.departure_time)
					break
				case "duration_asc":
					// For duration, we need to calculate the difference between arrival and departure times
					// Using SQL to calculate duration in minutes
					orderClause = asc(
						sql`EXTRACT(EPOCH FROM (${flights.arrival_time} - ${flights.departure_time})) / 60`,
					)
					break
				default:
					orderClause = asc(flights.price) // Default to price ascending
			}

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
				.orderBy(orderClause)
				.limit(limit)
				.offset(offset)

			const totalPages = Math.ceil(total / limit)

			logger.info("Flight search performed", {
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
	},
)

// GET /flights/:id - Get specific flight by ID
router.get(
	"/:id",
	validateRequest({ params: flightParamsSchema }),
	async (req, res, next) => {
		try {
			const { id } = req.params

			const flight = await db
				.select()
				.from(flights)
				.where(and(eq(flights.id, id), isNull(flights.deleted_at)))
				.limit(1)

			if (flight.length === 0) {
				throw new ApiError("Flight not found", 404)
			}

			logger.info("Flight retrieved", { flightId: id })

			res.json({
				success: true,
				data: flight[0],
			})
		} catch (error) {
			next(error)
		}
	},
)

export default router
