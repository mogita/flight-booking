import { db, client } from './connection'
import { flights } from './schema'

const sampleFlights = [
  {
    airline: 'Japan Airlines',
    flight_number: 'JL123',
    departure_time: new Date('2025-01-15T08:00:00Z'),
    arrival_time: new Date('2025-01-15T12:30:00Z'),
    price: '45000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: new Date('2025-01-15'),
    arrival_date: new Date('2025-01-15'),
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH456',
    departure_time: new Date('2025-01-15T14:00:00Z'),
    arrival_time: new Date('2025-01-15T18:45:00Z'),
    price: '52000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: new Date('2025-01-15'),
    arrival_date: new Date('2025-01-15'),
    is_round_trip: false,
  },
  {
    airline: 'Skymark Airlines',
    flight_number: 'BC789',
    departure_time: new Date('2025-01-15T10:30:00Z'),
    arrival_time: new Date('2025-01-15T15:15:00Z'),
    price: '38000',
    source: 'Tokyo (NRT)',
    destination: 'Osaka (KIX)',
    departure_date: new Date('2025-01-15'),
    arrival_date: new Date('2025-01-15'),
    is_round_trip: false,
  },
  {
    airline: 'Japan Airlines',
    flight_number: 'JL321',
    departure_time: new Date('2025-01-16T09:15:00Z'),
    arrival_time: new Date('2025-01-16T13:45:00Z'),
    price: '47000',
    source: 'Osaka (KIX)',
    destination: 'Tokyo (NRT)',
    departure_date: new Date('2025-01-16'),
    arrival_date: new Date('2025-01-16'),
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH654',
    departure_time: new Date('2025-01-16T16:00:00Z'),
    arrival_time: new Date('2025-01-16T20:30:00Z'),
    price: '54000',
    source: 'Osaka (KIX)',
    destination: 'Tokyo (NRT)',
    departure_date: new Date('2025-01-16'),
    arrival_date: new Date('2025-01-16'),
    is_round_trip: false,
  },
  {
    airline: 'Peach Aviation',
    flight_number: 'MM987',
    departure_time: new Date('2025-01-17T07:30:00Z'),
    arrival_time: new Date('2025-01-17T11:45:00Z'),
    price: '28000',
    source: 'Tokyo (NRT)',
    destination: 'Fukuoka (FUK)',
    departure_date: new Date('2025-01-17'),
    arrival_date: new Date('2025-01-17'),
    is_round_trip: false,
  },
  {
    airline: 'Jetstar Japan',
    flight_number: 'GK555',
    departure_time: new Date('2025-01-17T13:20:00Z'),
    arrival_time: new Date('2025-01-17T17:50:00Z'),
    price: '32000',
    source: 'Tokyo (NRT)',
    destination: 'Fukuoka (FUK)',
    departure_date: new Date('2025-01-17'),
    arrival_date: new Date('2025-01-17'),
    is_round_trip: false,
  },
  {
    airline: 'ANA',
    flight_number: 'NH777',
    departure_time: new Date('2025-01-18T11:00:00Z'),
    arrival_time: new Date('2025-01-18T15:30:00Z'),
    price: '58000',
    source: 'Fukuoka (FUK)',
    destination: 'Tokyo (NRT)',
    departure_date: new Date('2025-01-18'),
    arrival_date: new Date('2025-01-18'),
    is_round_trip: false,
  },
]

async function seedDatabase() {
  console.log('Seeding database with sample flights...')
  
  try {
    // Clear existing flights (optional - remove if you want to keep existing data)
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
