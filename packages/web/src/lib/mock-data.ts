import type { Flight, FlightSearchResponse } from '@flight-booking/shared'

// Mock flight data for testing
export const mockFlights: Flight[] = [
  {
    id: '1',
    airline: 'Japan Airlines',
    flight_number: 'JL123',
    departure_time: '2024-08-06T08:00:00Z',
    arrival_time: '2024-08-06T09:30:00Z',
    price: 25000,
    source: 'NRT',
    destination: 'KIX',
    departure_date: '2024-08-06',
    arrival_date: '2024-08-06',
    is_round_trip: false,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
  },
  {
    id: '2',
    airline: 'ANA',
    flight_number: 'NH456',
    departure_time: '2024-08-06T10:15:00Z',
    arrival_time: '2024-08-06T11:45:00Z',
    price: 23500,
    source: 'NRT',
    destination: 'KIX',
    departure_date: '2024-08-06',
    arrival_date: '2024-08-06',
    is_round_trip: false,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
  },
  {
    id: '3',
    airline: 'Skymark Airlines',
    flight_number: 'BC789',
    departure_time: '2024-08-06T14:30:00Z',
    arrival_time: '2024-08-06T16:00:00Z',
    price: 18900,
    source: 'NRT',
    destination: 'KIX',
    departure_date: '2024-08-06',
    arrival_date: '2024-08-06',
    is_round_trip: false,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
  },
  {
    id: '4',
    airline: 'Peach Aviation',
    flight_number: 'MM101',
    departure_time: '2024-08-06T16:45:00Z',
    arrival_time: '2024-08-06T18:15:00Z',
    price: 15800,
    source: 'NRT',
    destination: 'KIX',
    departure_date: '2024-08-06',
    arrival_date: '2024-08-06',
    is_round_trip: false,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
  },
  {
    id: '5',
    airline: 'Jetstar Japan',
    flight_number: 'GK202',
    departure_time: '2024-08-06T19:20:00Z',
    arrival_time: '2024-08-06T20:50:00Z',
    price: 16500,
    source: 'NRT',
    destination: 'KIX',
    departure_date: '2024-08-06',
    arrival_date: '2024-08-06',
    is_round_trip: false,
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
  },
]

export const mockFlightSearchResponse: FlightSearchResponse = {
  flights: mockFlights,
  total: 5,
  page: 1,
  limit: 10,
  total_pages: 1,
}

// Function to generate mock search results
export function generateMockSearchResults(
  source: string = 'NRT',
  destination: string = 'KIX',
  page: number = 1,
  limit: number = 10,
  sortBy: 'price_asc' | 'price_desc' | 'departure_asc' | 'departure_desc' | 'duration_asc' = 'price_asc'
): FlightSearchResponse {
  // Generate more flights for pagination testing
  const allFlights: Flight[] = []
  
  const airlines = [
    'Japan Airlines', 'ANA', 'Skymark Airlines', 'Peach Aviation', 
    'Jetstar Japan', 'Spring Japan', 'Air Do', 'Solaseed Air'
  ]
  
  const flightNumbers = ['123', '456', '789', '101', '202', '303', '404', '505']
  
  for (let i = 0; i < 25; i++) {
    const airline = airlines[i % airlines.length]
    const flightNumber = `${airline.substring(0, 2).toUpperCase()}${flightNumbers[i % flightNumbers.length]}`
    const basePrice = 15000 + (i * 1000) + Math.floor(Math.random() * 5000)
    const departureHour = 6 + (i % 16) // Flights from 6 AM to 10 PM
    const flightDuration = 90 + Math.floor(Math.random() * 60) // 90-150 minutes
    
    const departureTime = new Date('2024-08-06')
    departureTime.setHours(departureHour, Math.floor(Math.random() * 60))
    
    const arrivalTime = new Date(departureTime.getTime() + flightDuration * 60000)
    
    allFlights.push({
      id: `flight-${i + 1}`,
      airline,
      flight_number: flightNumber,
      departure_time: departureTime.toISOString(),
      arrival_time: arrivalTime.toISOString(),
      price: basePrice,
      source,
      destination,
      departure_date: '2024-08-06',
      arrival_date: '2024-08-06',
      is_round_trip: false,
      created_at: '2024-08-05T00:00:00Z',
      updated_at: '2024-08-05T00:00:00Z',
    })
  }

  // Sort flights based on sortBy parameter
  allFlights.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'departure_asc':
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      case 'departure_desc':
        return new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime()
      case 'duration_asc':
        const durationA = new Date(a.arrival_time).getTime() - new Date(a.departure_time).getTime()
        const durationB = new Date(b.arrival_time).getTime() - new Date(b.departure_time).getTime()
        return durationA - durationB
      default:
        return 0
    }
  })

  // Paginate results
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedFlights = allFlights.slice(startIndex, endIndex)
  
  return {
    flights: paginatedFlights,
    total: allFlights.length,
    page,
    limit,
    total_pages: Math.ceil(allFlights.length / limit),
  }
}
