import { db, client } from './connection'
import { flights, bookings } from './schema'

// Generate flights for a full year to ensure demo works year-round
const generateFlightsForYear = () => {
  const flights = []
  const today = new Date()

  // Generate flights for 365 days starting from today
  for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
    const flightDate = new Date(today)
    flightDate.setDate(today.getDate() + dayOffset)
    const dateStr = flightDate.toISOString().split('T')[0]

    // Create multiple flights for each day on popular routes
    const dailyFlights = [
      // Tokyo (NRT) → Osaka (KIX) - 3 flights per day
      {
        airline: 'Japan Airlines',
        flight_number: `JL${123 + (dayOffset % 100)}`,
        departure_time: new Date(`${dateStr}T08:00:00Z`),
        arrival_time: new Date(`${dateStr}T09:30:00Z`),
        price: (45000 + Math.floor(Math.random() * 10000)).toString(),
        source: 'Tokyo (NRT)',
        destination: 'Osaka (KIX)',
        departure_date: flightDate,
        arrival_date: flightDate,
        is_round_trip: false,
      },
      {
        airline: 'ANA',
        flight_number: `NH${456 + (dayOffset % 100)}`,
        departure_time: new Date(`${dateStr}T14:00:00Z`),
        arrival_time: new Date(`${dateStr}T15:30:00Z`),
        price: (52000 + Math.floor(Math.random() * 8000)).toString(),
        source: 'Tokyo (NRT)',
        destination: 'Osaka (KIX)',
        departure_date: flightDate,
        arrival_date: flightDate,
        is_round_trip: false,
      },
      {
        airline: 'Skymark Airlines',
        flight_number: `BC${789 + (dayOffset % 100)}`,
        departure_time: new Date(`${dateStr}T10:30:00Z`),
        arrival_time: new Date(`${dateStr}T12:00:00Z`),
        price: (38000 + Math.floor(Math.random() * 5000)).toString(),
        source: 'Tokyo (NRT)',
        destination: 'Osaka (KIX)',
        departure_date: flightDate,
        arrival_date: flightDate,
        is_round_trip: false,
      },

      // Tokyo (NRT) → Sapporo (CTS) - 3 flights per day
      {
        airline: 'Japan Airlines',
        flight_number: `JL${501 + (dayOffset % 100)}`,
        departure_time: new Date(`${dateStr}T09:00:00Z`),
        arrival_time: new Date(`${dateStr}T10:45:00Z`),
        price: (42000 + Math.floor(Math.random() * 8000)).toString(),
        source: 'Tokyo (NRT)',
        destination: 'Sapporo (CTS)',
        departure_date: flightDate,
        arrival_date: flightDate,
        is_round_trip: false,
      },
      {
        airline: 'ANA',
        flight_number: `NH${571 + (dayOffset % 100)}`,
        departure_time: new Date(`${dateStr}T15:30:00Z`),
        arrival_time: new Date(`${dateStr}T17:15:00Z`),
        price: (48000 + Math.floor(Math.random() * 7000)).toString(),
        source: 'Tokyo (NRT)',
        destination: 'Sapporo (CTS)',
        departure_date: flightDate,
        arrival_date: flightDate,
        is_round_trip: false,
      },
      {
        airline: 'Air Do',
        flight_number: `HD${61 + (dayOffset % 100)}`,
        departure_time: new Date(`${dateStr}T12:15:00Z`),
        arrival_time: new Date(`${dateStr}T14:00:00Z`),
        price: (35000 + Math.floor(Math.random() * 6000)).toString(),
        source: 'Tokyo (NRT)',
        destination: 'Sapporo (CTS)',
        departure_date: flightDate,
        arrival_date: flightDate,
        is_round_trip: false,
      },
    ]

    flights.push(...dailyFlights)
  }

  return flights
}

// Generate all flights for the year
const sampleFlights = generateFlightsForYear()

async function seedDatabase() {
  console.log('Seeding database with sample flights...')

  try {
    // Clear existing bookings first (due to foreign key constraint)
    await db.delete(bookings)
    console.log('Cleared existing bookings')

    // Clear existing flights
    await db.delete(flights)
    console.log('Cleared existing flights')

    // Insert sample flights
    await db.insert(flights).values(sampleFlights)
    console.log(`Inserted ${sampleFlights.length} sample flights`)

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seedDatabase()