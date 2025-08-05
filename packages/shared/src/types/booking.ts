export interface Booking {
  id: string
  flight_id: string
  fullname: string
  email: string
  phone?: string
  booking_type: 'one_way' | 'round_trip'
  round_trip_booking_id?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateBookingRequest {
  flight_id: string
  fullname: string
  email: string
  phone?: string
  booking_type?: 'one_way' | 'round_trip'
}

export interface RoundTripBooking {
  id: string
  outbound_booking_id: string
  return_booking_id: string
  total_price: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateRoundTripBookingRequest {
  outbound_flight_id: string
  return_flight_id: string
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

export interface RoundTripBookingWithFlights extends RoundTripBooking {
  outbound_booking: BookingWithFlight
  return_booking: BookingWithFlight
}
