import { client, db } from "./connection"
import { bookingFlights, bookings, bookingTrips, flights } from "./schema"

// Generate flights for a full year to ensure demo works year-round
const generateFlightsForYear = () => {
	const flights = []
	const today = new Date()

	// Generate flights for 365 days starting from today
	for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
		const flightDate = new Date(today)
		flightDate.setDate(today.getDate() + dayOffset)
		const dateStr = flightDate.toISOString().split("T")[0]

		// Create comprehensive route network - every city to every other city
		const cities = [
			{ code: "Tokyo (NRT)", name: "Tokyo" },
			{ code: "Osaka (KIX)", name: "Osaka" },
			{ code: "Fukuoka (FUK)", name: "Fukuoka" },
			{ code: "Sapporo (CTS)", name: "Sapporo" },
			{ code: "Okinawa (OKA)", name: "Okinawa" },
		]

		const airlines = [
			"Japan Airlines",
			"ANA",
			"Skymark Airlines",
			"Peach Aviation",
			"Jetstar Japan",
			"Air Do",
		]
		const flightPrefixes = ["JL", "NH", "BC", "MM", "GK", "HD"]

		const dailyFlights = []
		let flightCounter = 100

		// Generate flights between every city pair
		for (let i = 0; i < cities.length; i++) {
			for (let j = 0; j < cities.length; j++) {
				if (i !== j) {
					// Don't create flights from a city to itself
					const source = cities[i]
					const destination = cities[j]

					// Create 15-20 flights per route per day for proper pagination testing
					const numFlights = Math.floor(Math.random() * 6) + 15 // 15 to 20 flights

					for (let flightNum = 0; flightNum < numFlights; flightNum++) {
						const airlineIndex = Math.floor(Math.random() * airlines.length)
						const airline = airlines[airlineIndex]
						const prefix = flightPrefixes[airlineIndex]

						// Calculate flight duration based on distance (rough estimates)
						const getFlightDuration = (
							src: { name: string },
							dest: { name: string },
						): number => {
							const durations: Record<string, number> = {
								"Tokyo-Osaka": 90,
								"Tokyo-Fukuoka": 135,
								"Tokyo-Sapporo": 105,
								"Tokyo-Okinawa": 165,
								"Osaka-Tokyo": 90,
								"Osaka-Fukuoka": 75,
								"Osaka-Sapporo": 120,
								"Osaka-Okinawa": 120,
								"Fukuoka-Tokyo": 135,
								"Fukuoka-Osaka": 75,
								"Fukuoka-Sapporo": 150,
								"Fukuoka-Okinawa": 90,
								"Sapporo-Tokyo": 105,
								"Sapporo-Osaka": 120,
								"Sapporo-Fukuoka": 150,
								"Sapporo-Okinawa": 180,
								"Okinawa-Tokyo": 165,
								"Okinawa-Osaka": 120,
								"Okinawa-Fukuoka": 90,
								"Okinawa-Sapporo": 180,
							}
							const key = `${src.name}-${dest.name}`
							return durations[key] || 120 // default 2 hours
						}

						// Generate departure time (spread throughout the day)
						// With 15-20 flights, spread them evenly from 6:00 to 22:00 (16 hours)
						const timeSlot = (flightNum * 16) / numFlights // Distribute evenly across 16 hours
						const baseHour = Math.floor(6 + timeSlot + Math.random() * 0.5) // Add small random variation
						const minutes = Math.floor(Math.random() * 60)
						const finalHour = Math.min(Math.max(baseHour, 6), 22) // Ensure hour is between 6-22
						const departureTime = new Date(
							`${dateStr}T${finalHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00Z`,
						)

						const duration = getFlightDuration(source, destination)
						const arrivalTime = new Date(
							departureTime.getTime() + duration * 60000,
						) // duration in minutes

						// Calculate base price based on distance and add variation
						const getBasePrice = (
							src: { name: string },
							dest: { name: string },
						): number => {
							const prices: Record<string, number> = {
								"Tokyo-Osaka": 45000,
								"Tokyo-Fukuoka": 55000,
								"Tokyo-Sapporo": 42000,
								"Tokyo-Okinawa": 65000,
								"Osaka-Tokyo": 45000,
								"Osaka-Fukuoka": 35000,
								"Osaka-Sapporo": 48000,
								"Osaka-Okinawa": 52000,
								"Fukuoka-Tokyo": 55000,
								"Fukuoka-Osaka": 35000,
								"Fukuoka-Sapporo": 58000,
								"Fukuoka-Okinawa": 38000,
								"Sapporo-Tokyo": 42000,
								"Sapporo-Osaka": 48000,
								"Sapporo-Fukuoka": 58000,
								"Sapporo-Okinawa": 72000,
								"Okinawa-Tokyo": 65000,
								"Okinawa-Osaka": 52000,
								"Okinawa-Fukuoka": 38000,
								"Okinawa-Sapporo": 72000,
							}
							const key = `${src.name}-${dest.name}`
							return prices[key] || 50000 // default price
						}

						const basePrice = getBasePrice(source, destination)
						const priceVariation = Math.floor(Math.random() * 15000) - 7500 // ±7500 yen variation
						const finalPrice = Math.max(basePrice + priceVariation, 20000) // minimum 20000 yen

						dailyFlights.push({
							airline: airline,
							flight_number: `${prefix}${flightCounter + (dayOffset % 100)}`,
							departure_time: departureTime,
							arrival_time: arrivalTime,
							price: finalPrice.toString(),
							source: source.code,
							destination: destination.code,
							departure_date: flightDate,
							arrival_date:
								arrivalTime.getDate() !== departureTime.getDate()
									? new Date(
											arrivalTime.getFullYear(),
											arrivalTime.getMonth(),
											arrivalTime.getDate(),
										)
									: flightDate,
							is_round_trip: false,
						})

						flightCounter++
					}
				}
			}
		}

		flights.push(...dailyFlights)
	}

	return flights
}

// Generate all flights for the year
const sampleFlights = generateFlightsForYear()

// Create sample bookings with the new schema
const createSampleBookings = async () => {
	try {
		// Get some flights to use for bookings
		const availableFlights = await db.select().from(flights).limit(20)

		if (availableFlights.length === 0) {
			console.log("No flights available for creating sample bookings")
			return
		}

		// Sample booking 1: One-way trip (single flight)
		const booking1 = await db
			.insert(bookings)
			.values({
				user_id: 1,
				fullname: "John Doe",
				email: "john.doe@example.com",
				phone: "+81-90-1234-5678",
				trip_type: "one_way",
				total_price: availableFlights[0].price,
			})
			.returning()

		const trip1 = await db
			.insert(bookingTrips)
			.values({
				user_id: 1,
				booking_id: booking1[0].id,
				trip_order: 1,
				source_airport: availableFlights[0].source,
				destination_airport: availableFlights[0].destination,
				departure_time: availableFlights[0].departure_time,
				arrival_time: availableFlights[0].arrival_time,
				total_price: availableFlights[0].price,
			})
			.returning()

		await db.insert(bookingFlights).values({
			user_id: 1,
			booking_id: booking1[0].id,
			booking_trip_id: trip1[0].id,
			flight_order: 1,
			airline: availableFlights[0].airline,
			flight_number: availableFlights[0].flight_number,
			departure_time: availableFlights[0].departure_time,
			arrival_time: availableFlights[0].arrival_time,
			source_airport: availableFlights[0].source,
			destination_airport: availableFlights[0].destination,
			departure_date: availableFlights[0].departure_date,
			arrival_date: availableFlights[0].arrival_date,
			price: availableFlights[0].price,
		})

		console.log("Sample bookings created successfully!")
	} catch (error) {
		console.error("Failed to create sample bookings:", error)
		throw error
	}
}

async function seedDatabase() {
	console.log("Seeding database with comprehensive flight network...")

	try {
		// Clear existing flights (bookings will be cleared by cascade if they exist)
		await db.delete(flights)
		console.log("Cleared existing flights")

		// Insert flights in batches to avoid memory issues
		const batchSize = 1000
		const totalFlights = sampleFlights.length
		console.log(
			`Inserting ${totalFlights} flights in batches of ${batchSize}...`,
		)

		for (let i = 0; i < totalFlights; i += batchSize) {
			const batch = sampleFlights.slice(i, i + batchSize)
			await db.insert(flights).values(batch)
			console.log(
				`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalFlights / batchSize)} (${batch.length} flights)`,
			)
		}

		// Create sample bookings
		console.log("Creating sample bookings...")
		await createSampleBookings()

		console.log(
			`Database seeding completed successfully! Total flights: ${totalFlights}`,
		)
	} catch (error) {
		console.error("Seeding failed:", error)
		process.exit(1)
	} finally {
		await client.end()
	}
}

seedDatabase()
