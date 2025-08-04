import { db, client } from './connection'
import { flights } from './schema'

async function testConnection() {
  console.log('Testing database connection...')
  
  try {
    // Test basic query
    const flightCount = await db.select().from(flights)
    console.log(`✅ Database connection successful!`)
    console.log(`✅ Found ${flightCount.length} flights in the database`)
    
    // Show first flight as example
    if (flightCount.length > 0) {
      console.log('✅ Sample flight:', {
        id: flightCount[0].id,
        airline: flightCount[0].airline,
        flight_number: flightCount[0].flight_number,
        source: flightCount[0].source,
        destination: flightCount[0].destination,
        price: flightCount[0].price
      })
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

testConnection()
