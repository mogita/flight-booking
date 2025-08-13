export const API_ENDPOINTS = {
	// Auth endpoints
	LOGIN: "/auth/login",

	// Flight endpoints
	FLIGHTS: "/flights",
	FLIGHT_BY_ID: (id: string) => `/flights/${id}`,

	// Booking endpoints
	BOOKINGS: "/bookings",
	BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
} as const

export const SORT_OPTIONS = {
	PRICE_ASC: "price_asc",
	PRICE_DESC: "price_desc",
	DEPARTURE_ASC: "departure_time_asc",
	DEPARTURE_DESC: "departure_time_desc",
	ARRIVAL_ASC: "arrival_time_asc",
	ARRIVAL_DESC: "arrival_time_desc",
} as const

export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_LIMIT: 10,
	MAX_LIMIT: 100,
} as const

export const VALIDATION = {
	MIN_NAME_LENGTH: 2,
	MAX_NAME_LENGTH: 100,
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
} as const
