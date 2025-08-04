export interface Booking {
  id: string
  flight_id: string
  fullname: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateBookingRequest {
  flight_id: string
  fullname: string
  email: string
  phone?: string
}

export interface BookingWithFlight extends Booking {
  flight: {
    airline: string
    flight_number: string
    departure_time: string
    arrival_time: string
    price: number
    source: string
    destination: string
    departure_date: string
    arrival_date: string
  }
}
