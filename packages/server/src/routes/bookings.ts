import { and, desc, eq, isNull } from "drizzle-orm"
import { Router } from "express"
import { z } from "zod"
import { db } from "../db/connection"
import { bookings, flights, roundTripBookings } from "../db/schema"
import { authenticateToken } from "../middleware/auth"
import { ApiError } from "../middleware/error-handler"
import { validateRequest } from "../middleware/validation"
import { logger } from "../utils/logger"

const router = Router()

// Create booking schema
const createBookingSchema = z.object({
	flight_id: z.string().min(1, "Flight ID is required"),
	fullname: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(200, "Full name too long"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
})

// Create round trip booking schema
const createRoundTripBookingSchema = z.object({
	outbound_flight_id: z.string().min(1, "Outbound flight ID is required"),
	return_flight_id: z.string().min(1, "Return flight ID is required"),
	fullname: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(200, "Full name too long"),
	email: z.string().email("Invalid email address"),
	phone: z.string().optional(),
})

// Update booking schema
const updateBookingSchema = z.object({
	fullname: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(200, "Full name too long")
		.optional(),
	email: z.string().email("Invalid email address").optional(),
	phone: z.string().optional(),
})

// Booking ID params schema
const bookingParamsSchema = z.object({
	id: z.string().min(1, "Booking ID is required"),
})

// Apply authentication to all booking routes
router.use(authenticateToken)

// GET /bookings - Get all bookings for authenticated user
router.get("/", async (req, res, next) => {
	try {
		const bookingResults = await db
			.select({
				id: bookings.id,
				flight_id: bookings.flight_id,
				fullname: bookings.fullname,
				email: bookings.email,
				phone: bookings.phone,
				booking_type: bookings.booking_type,
				round_trip_booking_id: bookings.round_trip_booking_id,
				created_at: bookings.created_at,
				updated_at: bookings.updated_at,
				flight: {
					airline: flights.airline,
					flight_number: flights.flight_number,
					departure_time: flights.departure_time,
					arrival_time: flights.arrival_time,
					price: flights.price,
					source: flights.source,
					destination: flights.destination,
					departure_date: flights.departure_date,
					arrival_date: flights.arrival_date,
				},
			})
			.from(bookings)
			.leftJoin(flights, eq(bookings.flight_id, flights.id))
			.where(isNull(bookings.deleted_at))
			.orderBy(desc(bookings.created_at))

		logger.info("Bookings retrieved", {
			user: req.user?.username,
			count: bookingResults.length,
		})

		res.json({
			success: true,
			data: bookingResults,
		})
	} catch (error) {
		next(error)
	}
})

// GET /bookings/:id - Get specific booking by ID
router.get(
	"/:id",
	validateRequest({ params: bookingParamsSchema }),
	async (req, res, next) => {
		try {
			const { id } = req.params

			const bookingResult = await db
				.select({
					id: bookings.id,
					flight_id: bookings.flight_id,
					fullname: bookings.fullname,
					email: bookings.email,
					phone: bookings.phone,
					created_at: bookings.created_at,
					updated_at: bookings.updated_at,
					flight: {
						airline: flights.airline,
						flight_number: flights.flight_number,
						departure_time: flights.departure_time,
						arrival_time: flights.arrival_time,
						price: flights.price,
						source: flights.source,
						destination: flights.destination,
						departure_date: flights.departure_date,
						arrival_date: flights.arrival_date,
					},
				})
				.from(bookings)
				.leftJoin(flights, eq(bookings.flight_id, flights.id))
				.where(and(eq(bookings.id, id), isNull(bookings.deleted_at)))
				.limit(1)

			if (bookingResult.length === 0) {
				throw new ApiError("Booking not found", 404)
			}

			logger.info("Booking retrieved", {
				bookingId: id,
				user: req.user?.username,
			})

			res.json({
				success: true,
				data: bookingResult[0],
			})
		} catch (error) {
			next(error)
		}
	},
)

// POST /bookings - Create new booking
router.post(
	"/",
	validateRequest({ body: createBookingSchema }),
	async (req, res, next) => {
		try {
			const { flight_id, fullname, email, phone } = req.body

			// Verify flight exists
			const flight = await db
				.select()
				.from(flights)
				.where(and(eq(flights.id, flight_id), isNull(flights.deleted_at)))
				.limit(1)

			if (flight.length === 0) {
				throw new ApiError("Flight not found", 404)
			}

			// Create booking
			const [newBooking] = await db
				.insert(bookings)
				.values({
					flight_id,
					fullname,
					email,
					phone,
				})
				.returning()

			logger.info("Booking created", {
				bookingId: newBooking.id,
				flightId: flight_id,
				user: req.user?.username,
				passenger: { fullname, email },
			})

			res.status(201).json({
				success: true,
				data: newBooking,
				message: "Booking created successfully",
			})
		} catch (error) {
			next(error)
		}
	},
)

// POST /bookings/round-trip - Create round trip booking
router.post(
	"/round-trip",
	validateRequest({ body: createRoundTripBookingSchema }),
	async (req, res, next) => {
		try {
			const { outbound_flight_id, return_flight_id, fullname, email, phone } =
				req.body

			// Verify both flights exist
			const outboundFlight = await db
				.select()
				.from(flights)
				.where(
					and(eq(flights.id, outbound_flight_id), isNull(flights.deleted_at)),
				)
				.limit(1)

			const returnFlight = await db
				.select()
				.from(flights)
				.where(
					and(eq(flights.id, return_flight_id), isNull(flights.deleted_at)),
				)
				.limit(1)

			if (outboundFlight.length === 0) {
				throw new ApiError("Outbound flight not found", 404)
			}

			if (returnFlight.length === 0) {
				throw new ApiError("Return flight not found", 404)
			}

			// Create both bookings in a transaction
			const result = await db.transaction(async (tx) => {
				// Create outbound booking
				const [outboundBooking] = await tx
					.insert(bookings)
					.values({
						flight_id: outbound_flight_id,
						fullname,
						email,
						phone,
						booking_type: "round_trip",
					})
					.returning()

				// Create return booking
				const [returnBooking] = await tx
					.insert(bookings)
					.values({
						flight_id: return_flight_id,
						fullname,
						email,
						phone,
						booking_type: "round_trip",
					})
					.returning()

				// Calculate total price
				const totalPrice =
					Number(outboundFlight[0].price) + Number(returnFlight[0].price)

				// Create round trip booking record
				const [roundTripBooking] = await tx
					.insert(roundTripBookings)
					.values({
						outbound_booking_id: outboundBooking.id,
						return_booking_id: returnBooking.id,
						total_price: totalPrice.toString(),
					})
					.returning()

				// Update both bookings with round trip booking ID
				await tx
					.update(bookings)
					.set({ round_trip_booking_id: roundTripBooking.id })
					.where(eq(bookings.id, outboundBooking.id))

				await tx
					.update(bookings)
					.set({ round_trip_booking_id: roundTripBooking.id })
					.where(eq(bookings.id, returnBooking.id))

				return {
					roundTripBooking,
					outboundBooking,
					returnBooking,
					totalPrice,
				}
			})

			logger.info("Round trip booking created", {
				roundTripBookingId: result.roundTripBooking.id,
				outboundBookingId: result.outboundBooking.id,
				returnBookingId: result.returnBooking.id,
				outboundFlightId: outbound_flight_id,
				returnFlightId: return_flight_id,
				user: req.user?.username,
				passenger: { fullname, email },
				totalPrice: result.totalPrice,
			})

			res.status(201).json({
				success: true,
				data: {
					round_trip_booking: result.roundTripBooking,
					outbound_booking: result.outboundBooking,
					return_booking: result.returnBooking,
					total_price: result.totalPrice,
				},
				message: "Round trip booking created successfully",
			})
		} catch (error) {
			next(error)
		}
	},
)

// PUT /bookings/:id - Update booking
router.put(
	"/:id",
	validateRequest({
		params: bookingParamsSchema,
		body: updateBookingSchema,
	}),
	async (req, res, next) => {
		try {
			const { id } = req.params
			const updateData = req.body

			// Check if booking exists
			const existingBooking = await db
				.select()
				.from(bookings)
				.where(and(eq(bookings.id, id), isNull(bookings.deleted_at)))
				.limit(1)

			if (existingBooking.length === 0) {
				throw new ApiError("Booking not found", 404)
			}

			// Update booking
			const [updatedBooking] = await db
				.update(bookings)
				.set({
					...updateData,
					updated_at: new Date(),
				})
				.where(eq(bookings.id, id))
				.returning()

			logger.info("Booking updated", {
				bookingId: id,
				user: req.user?.username,
				updates: updateData,
			})

			res.json({
				success: true,
				data: updatedBooking,
				message: "Booking updated successfully",
			})
		} catch (error) {
			next(error)
		}
	},
)

// DELETE /bookings/:id - Soft delete booking
router.delete(
	"/:id",
	validateRequest({ params: bookingParamsSchema }),
	async (req, res, next) => {
		try {
			const { id } = req.params

			// Check if booking exists
			const existingBooking = await db
				.select()
				.from(bookings)
				.where(and(eq(bookings.id, id), isNull(bookings.deleted_at)))
				.limit(1)

			if (existingBooking.length === 0) {
				throw new ApiError("Booking not found", 404)
			}

			// Soft delete booking
			await db
				.update(bookings)
				.set({
					deleted_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(bookings.id, id))

			logger.info("Booking deleted", {
				bookingId: id,
				user: req.user?.username,
			})

			res.json({
				success: true,
				message: "Booking deleted successfully",
			})
		} catch (error) {
			next(error)
		}
	},
)

export default router
