export interface Flight {
  id: string
  airline: string
  flight_number: string
  departure_time: string
  arrival_time: string
  price: number
  source: string
  destination: string
  departure_date: string
  arrival_date: string
  is_round_trip: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface FlightSearchParams {
  source?: string
  destination?: string
  departure_date?: string
  return_date?: string
  is_round_trip?: boolean
  sort_by?: 'price_asc' | 'price_desc' | 'departure_asc' | 'departure_desc' | 'duration_asc'
  page?: number
  limit?: number
}

export const DEFAULT_PAGE_SIZE = 5

export interface FlightSearchResponse {
  flights: Flight[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
