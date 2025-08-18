import { desc, eq, isNull } from "drizzle-orm"
import { type Router as ExpressRouter, Router } from "express"
import { z } from "zod"
import { db } from "../db/connection"
import { bookingFlights, bookings, bookingTrips, flights } from "../db/schema"
import { authenticateToken } from "../middleware/auth"
import { ApiError } from "../middleware/error-handler"
import { validateRequest } from "../middleware/validation"
import { logger } from "../utils/logger"

const router: ExpressRouter = Router()

// Create booking schema with new structure
const createBookingSchema = z.object({
	fullname: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(200, "Full name too long"),
	email: z.string().email("Invalid email address"),
	phone: z
		.string()
		.regex(/^[+]?[0-9\-\s()]+$/, "Invalid phone number format")
		.optional(),
	trip_type: z.enum(["one_way", "round_trip", "multi_stop"]),
	trips: z
		.array(
			z.object({
				flights: z
					.array(
						z.object({
							flight_id: z.string().min(1, "Flight ID is required"),
							flight_order: z
								.number()
								.min(1, "Flight order must be at least 1"),
						}),
					)
					.min(1, "At least one flight is required"),
			}),
		)
		.min(1, "At least one trip is required"),
})

// Legacy booking schema for backward compatibility
const createLegacyBookingSchema = z.object({
	flight_id: z.string().min(1, "Flight ID is required"),
	fullname: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(200, "Full name too long"),
	email: z.string().email("Invalid email address"),
	phone: z
		.string()
		.regex(/^[+]?[0-9\-\s()]+$/, "Invalid phone number format")
		.optional(),
	booking_type: z.enum(["one_way", "round_trip"]).default("one_way"),
})

// Apply authentication to all booking routes
router.use(authenticateToken)

// GET /bookings - Get all bookings with trips and flights
router.get("/", async (_req, res, next) => {
	try {
		// Get all bookings for user ID 1 (demo user)
		const userBookings = await db
			.select()
			.from(bookings)
			.where(eq(bookings.user_id, 1))
			.orderBy(desc(bookings.created_at))

		// Get trips for each booking
		const bookingsWithTrips = await Promise.all(
			userBookings.map(async (booking) => {
				const trips = await db
					.select()
					.from(bookingTrips)
					.where(eq(bookingTrips.booking_id, booking.id))
					.orderBy(bookingTrips.created_at)

				// Get flights for each trip
				const tripsWithFlights = await Promise.all(
					trips.map(async (trip) => {
						const flights = await db
							.select()
							.from(bookingFlights)
							.where(eq(bookingFlights.booking_trip_id, trip.id))
							.orderBy(bookingFlights.flight_order)

						return {
							...trip,
							flights,
						}
					}),
				)

				return {
					...booking,
					trips: tripsWithFlights,
				}
			}),
		)

		logger.info("Retrieved bookings", {
			count: bookingsWithTrips.length,
			user_id: 1,
		})

		res.json({
			success: true,
			data: bookingsWithTrips,
		})
	} catch (error) {
		next(error)
	}
})

// POST /bookings - Create new booking with trips and flights
router.post(
	"/",
	validateRequest({ body: createBookingSchema }),
	async (req, res, next) => {
		try {
			const { fullname, email, phone, trip_type, trips } = req.body

			// Calculate total price by fetching flight prices
			let totalPrice = 0
			for (const trip of trips) {
				for (const flightRequest of trip.flights) {
					const flight = await db
						.select()
						.from(flights)
						.where(eq(flights.id, flightRequest.flight_id))
						.limit(1)

					if (flight.length === 0) {
						throw new ApiError(
							`Flight ${flightRequest.flight_id} not found`,
							404,
						)
					}

					totalPrice += Number(flight[0].price)
				}
			}

			// Create the booking
			const newBooking = await db
				.insert(bookings)
				.values({
					user_id: 1, // Demo user
					fullname,
					email,
					phone,
					trip_type,
					total_price: totalPrice.toString(),
				})
				.returning()

			// Create trips and flights
			const createdTrips = []
			for (let tripIndex = 0; tripIndex < trips.length; tripIndex++) {
				const tripRequest = trips[tripIndex]
				// Calculate trip price
				let tripPrice = 0
				const tripFlights = []

				for (const flightRequest of tripRequest.flights) {
					const flight = await db
						.select()
						.from(flights)
						.where(eq(flights.id, flightRequest.flight_id))
						.limit(1)

					tripFlights.push(flight[0])
					tripPrice += Number(flight[0].price)
				}

				// Determine trip source/destination and times
				const firstFlight = tripFlights[0]
				const lastFlight = tripFlights[tripFlights.length - 1]

				// Create the trip
				const newTrip = await db
					.insert(bookingTrips)
					.values({
						user_id: 1,
						booking_id: newBooking[0].id,
						trip_order: tripIndex + 1, // 1-based trip order
						source_airport: firstFlight.source,
						destination_airport: lastFlight.destination,
						departure_time: firstFlight.departure_time,
						arrival_time: lastFlight.arrival_time,
						total_price: tripPrice.toString(),
					})
					.returning()

				// Create booking flights
				const createdFlights = []
				for (let i = 0; i < tripFlights.length; i++) {
					const flight = tripFlights[i]
					const flightRequest = tripRequest.flights[i]

					const newBookingFlight = await db
						.insert(bookingFlights)
						.values({
							user_id: 1,
							booking_id: newBooking[0].id,
							booking_trip_id: newTrip[0].id,
							flight_order: flightRequest.flight_order,
							airline: flight.airline,
							flight_number: flight.flight_number,
							departure_time: flight.departure_time,
							arrival_time: flight.arrival_time,
							source_airport: flight.source,
							destination_airport: flight.destination,
							departure_date: flight.departure_date,
							arrival_date: flight.arrival_date,
							price: flight.price,
						})
						.returning()

					createdFlights.push(newBookingFlight[0])
				}

				createdTrips.push({
					...newTrip[0],
					flights: createdFlights,
				})
			}

			const result = {
				...newBooking[0],
				trips: createdTrips,
			}

			logger.info("Booking created", {
				booking_id: newBooking[0].id,
				user_id: 1,
				total_price: totalPrice,
				trips_count: trips.length,
			})

			res.status(201).json({
				success: true,
				data: result,
			})
		} catch (error) {
			next(error)
		}
	},
)

// Legacy endpoint: POST /bookings/legacy - Create booking with old schema
router.post(
	"/legacy",
	validateRequest({ body: createLegacyBookingSchema }),
	async (req, res, next) => {
		try {
			const { flight_id, fullname, email, phone, booking_type } = req.body

			// Get the flight details
			const flight = await db
				.select()
				.from(flights)
				.where(eq(flights.id, flight_id))
				.limit(1)

			if (flight.length === 0) {
				throw new ApiError("Flight not found", 404)
			}

			const flightData = flight[0]

			// Create the booking
			const newBooking = await db
				.insert(bookings)
				.values({
					user_id: 1, // Demo user
					fullname,
					email,
					phone,
					trip_type: booking_type === "round_trip" ? "round_trip" : "one_way",
					total_price: flightData.price,
				})
				.returning()

			// Create the trip
			const newTrip = await db
				.insert(bookingTrips)
				.values({
					user_id: 1,
					booking_id: newBooking[0].id,
					trip_order: 1, // First and only trip for legacy bookings
					source_airport: flightData.source,
					destination_airport: flightData.destination,
					departure_time: flightData.departure_time,
					arrival_time: flightData.arrival_time,
					total_price: flightData.price,
				})
				.returning()

			// Create the booking flight
			await db
				.insert(bookingFlights)
				.values({
					user_id: 1,
					booking_id: newBooking[0].id,
					booking_trip_id: newTrip[0].id,
					flight_order: 1,
					airline: flightData.airline,
					flight_number: flightData.flight_number,
					departure_time: flightData.departure_time,
					arrival_time: flightData.arrival_time,
					source_airport: flightData.source,
					destination_airport: flightData.destination,
					departure_date: flightData.departure_date,
					arrival_date: flightData.arrival_date,
					price: flightData.price,
				})
				.returning()

			// Return in legacy format for backward compatibility
			const legacyResult = {
				id: newBooking[0].id,
				flight_id: flight_id,
				fullname,
				email,
				phone,
				booking_type,
				created_at: newBooking[0].created_at,
				updated_at: newBooking[0].updated_at,
				flight: {
					airline: flightData.airline,
					flight_number: flightData.flight_number,
					departure_time: flightData.departure_time,
					arrival_time: flightData.arrival_time,
					price: Number(flightData.price),
					source: flightData.source,
					destination: flightData.destination,
					departure_date: flightData.departure_date,
					arrival_date: flightData.arrival_date,
				},
			}

			logger.info("Legacy booking created", {
				booking_id: newBooking[0].id,
				flight_id,
				booking_type,
			})

			res.status(201).json({
				success: true,
				data: legacyResult,
			})
		} catch (error) {
			next(error)
		}
	},
)

export default router
