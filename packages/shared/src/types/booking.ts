// Booking - financial and user information
export interface Booking {
	id: string
	user_id: number
	fullname: string
	email: string
	phone?: string
	trip_type: "one_way" | "round_trip" | "multi_stop"
	total_price: number
	created_at: string
	updated_at: string
	deleted_at?: string
}

// Booking Trip - journey segment within a booking
export interface BookingTrip {
	id: string
	user_id: number
	booking_id: string
	trip_order: number
	source_airport: string
	destination_airport: string
	departure_time: string
	arrival_time: string
	total_price: number
	created_at: string
	updated_at: string
	deleted_at?: string
}

// Booking Flight - individual flight within a trip
export interface BookingFlight {
	id: string
	user_id: number
	booking_id: string
	booking_trip_id: string
	flight_order: number
	airline: string
	flight_number: string
	departure_time: string
	arrival_time: string
	source_airport: string
	destination_airport: string
	departure_date: string
	arrival_date: string
	price: number
	created_at: string
	updated_at: string
	deleted_at?: string
}

// Request types for creating bookings
export interface CreateBookingRequest {
	fullname: string
	email: string
	phone?: string
	trip_type: "one_way" | "round_trip" | "multi_stop"
	trips: CreateBookingTripRequest[]
}

export interface CreateBookingTripRequest {
	flights: CreateBookingFlightRequest[]
}

export interface CreateBookingFlightRequest {
	flight_id: string // Reference to the original flight to copy data from
	flight_order: number
}

// Response types with nested data
export interface BookingWithTrips extends Booking {
	trips: BookingTripWithFlights[]
}

export interface BookingTripWithFlights extends BookingTrip {
	flights: BookingFlight[]
}
