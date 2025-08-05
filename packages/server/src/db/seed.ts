import { db, client } from './connection'
import { flights, bookings } from './schema'

// Create flights for today and tomorrow to ensure demo always has data
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const sampleFlights = [
  // Flights for TODAY
  {
    airline: 'Japan Airlines',
    flight_number: 'JL123',
    departure_time: new Date(`${today.toISOString().split('T')[0]}T08:00:00Z`),
    arrival_time: new Date(`${today.toISOString().split('T')[0]}T09:30:00Z`),
    price: '45000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: today,
    arrival_date: today,
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH456',
    departure_time: new Date(`${today.toISOString().split('T')[0]}T14:00:00Z`),
    arrival_time: new Date(`${today.toISOString().split('T')[0]}T15:30:00Z`),
    price: '52000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: today,
    arrival_date: today,
    is_round_trip: false,
  },
  {
    airline: 'Skymark Airlines',
    flight_number: 'BC789',
    departure_time: new Date(`${today.toISOString().split('T')[0]}T10:30:00Z`),
    arrival_time: new Date(`${today.toISOString().split('T')[0]}T12:00:00Z`),
    price: '38000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: today,
    arrival_date: today,
    is_round_trip: false,
  },
  {
    airline: 'Japan Airlines',
    flight_number: 'JL501',
    departure_time: new Date(`${today.toISOString().split('T')[0]}T09:00:00Z`),
    arrival_time: new Date(`${today.toISOString().split('T')[0]}T10:45:00Z`),
    price: '42000',
    source: 'Tokyo (NRT)',
    destination: 'Sapporo (CTS)',
    departure_date: today,
    arrival_date: today,
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH571',
    departure_time: new Date(`${today.toISOString().split('T')[0]}T15:30:00Z`),
    arrival_time: new Date(`${today.toISOString().split('T')[0]}T17:15:00Z`),
    price: '48000',
    source: 'Tokyo (NRT)',
    destination: 'Sapporo (CTS)',
    departure_date: today,
    arrival_date: today,
    is_round_trip: false,
  },
  {
    airline: 'Air Do',
    flight_number: 'HD61',
    departure_time: new Date(`${today.toISOString().split('T')[0]}T12:15:00Z`),
    arrival_time: new Date(`${today.toISOString().split('T')[0]}T14:00:00Z`),
    price: '35000',
    source: 'Tokyo (NRT)',
    destination: 'Sapporo (CTS)',
    departure_date: today,
    arrival_date: today,
    is_round_trip: false,
  },

  // Flights for TOMORROW
  {
    airline: 'Japan Airlines',
    flight_number: 'JL124',
    departure_time: new Date(`${tomorrow.toISOString().split('T')[0]}T08:00:00Z`),
    arrival_time: new Date(`${tomorrow.toISOString().split('T')[0]}T09:30:00Z`),
    price: '45000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: tomorrow,
    arrival_date: tomorrow,
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH457',
    departure_time: new Date(`${tomorrow.toISOString().split('T')[0]}T14:00:00Z`),
    arrival_time: new Date(`${tomorrow.toISOString().split('T')[0]}T15:30:00Z`),
    price: '52000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: tomorrow,
    arrival_date: tomorrow,
    is_round_trip: false,
  },
  {
    airline: 'Skymark Airlines',
    flight_number: 'BC790',
    departure_time: new Date(`${tomorrow.toISOString().split('T')[0]}T10:30:00Z`),
    arrival_time: new Date(`${tomorrow.toISOString().split('T')[0]}T12:00:00Z`),
    price: '38000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: tomorrow,
    arrival_date: tomorrow,
    is_round_trip: false,
  },
  {
    airline: 'Japan Airlines',
    flight_number: 'JL502',
    departure_time: new Date(`${tomorrow.toISOString().split('T')[0]}T09:00:00Z`),
    arrival_time: new Date(`${tomorrow.toISOString().split('T')[0]}T10:45:00Z`),
    price: '42000',
    source: 'Tokyo (NRT)',
    destination: 'Sapporo (CTS)',
    departure_date: tomorrow,
    arrival_date: tomorrow,
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH572',
    departure_time: new Date(`${tomorrow.toISOString().split('T')[0]}T15:30:00Z`),
    arrival_time: new Date(`${tomorrow.toISOString().split('T')[0]}T17:15:00Z`),
    price: '48000',
    source: 'Tokyo (NRT)',
    destination: 'Sapporo (CTS)',
    departure_date: tomorrow,
    arrival_date: tomorrow,
    is_round_trip: false,
  },
  {
    airline: 'Air Do',
    flight_number: 'HD62',
    departure_time: new Date(`${tomorrow.toISOString().split('T')[0]}T12:15:00Z`),
    arrival_time: new Date(`${tomorrow.toISOString().split('T')[0]}T14:00:00Z`),
    price: '35000',
    source: 'Tokyo (NRT)',
    destination: 'Sapporo (CTS)',
    departure_date: tomorrow,
    arrival_date: tomorrow,
    is_round_trip: false,
  },
]

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