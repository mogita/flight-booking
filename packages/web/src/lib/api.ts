import type {
	ApiResponse,
	Booking,
	BookingWithFlight,
	CreateBookingRequest,
	CreateRoundTripBookingRequest,
	Flight,
	FlightSearchParams,
	FlightSearchResponse,
	LoginRequest,
	LoginResponse,
	RoundTripBooking,
} from "@flight-booking/shared"

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// Global redirect handler for 401 errors
let redirectToLogin: ((path?: string) => void) | null = null

export const setAuthRedirectHandler = (handler: (path?: string) => void) => {
	redirectToLogin = handler
}

// API Error class
export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public response?: unknown,
	) {
		super(message)
		this.name = "ApiError"
	}
}

// Extended RequestInit interface to include custom options
interface ApiRequestOptions extends RequestInit {
	skipGlobalAuth401Handler?: boolean
}

// Generic API request function
async function apiRequest<T>(
	endpoint: string,
	options: ApiRequestOptions = {},
): Promise<T | undefined> {
	const url = `${API_BASE_URL}/api${endpoint}`

	// Extract custom options before passing to fetch
	const { skipGlobalAuth401Handler, ...fetchOptions } = options

	const config: RequestInit = {
		headers: {
			"Content-Type": "application/json",
			...fetchOptions.headers,
		},
		...fetchOptions,
	}

	// Add auth token if available
	const token = localStorage.getItem("auth-token")
	if (token) {
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${token}`,
		}
	}

	try {
		const response = await fetch(url, config)
		const data = await response.json()

		if (!response.ok) {
			// Handle 401 Unauthorized errors with automatic redirect (unless skipped)
			if (
				response.status === 401 &&
				redirectToLogin &&
				!skipGlobalAuth401Handler
			) {
				// Clear invalid token
				localStorage.removeItem("auth-token")
				// Redirect to login with current path as return URL
				redirectToLogin(window.location.pathname + window.location.search)
				return undefined
			}

			throw new ApiError(
				data.error || data.message || "An error occurred",
				response.status,
				data,
			)
		}

		return data
	} catch (error) {
		if (error instanceof ApiError) {
			throw error
		}

		// Network or other errors
		throw new ApiError("Network error. Please check your connection.", 0, error)
	}
}

// Authentication API
export const authApi = {
	login: async (credentials: LoginRequest): Promise<LoginResponse> => {
		const response = await apiRequest<ApiResponse<LoginResponse>>(
			"/auth/login",
			{
				method: "POST",
				body: JSON.stringify(credentials),
			},
		)

		if (response?.data?.token) {
			localStorage.setItem("auth-token", response.data.token)
		}

		if (!response?.data) {
			throw new ApiError("Login failed - no response data", 500)
		}

		return response.data
	},

	logout: () => {
		localStorage.removeItem("auth-token")
	},

	getToken: (): string | null => {
		return localStorage.getItem("auth-token")
	},

	isAuthenticated: (): boolean => {
		return !!localStorage.getItem("auth-token")
	},

	validateToken: async (
		token: string,
	): Promise<{ user: { username: string }; valid: boolean } | null> => {
		try {
			const response = await apiRequest<
				ApiResponse<{ user: { username: string }; valid: boolean }>
			>("/auth/validate", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				skipGlobalAuth401Handler: true, // Prevent automatic redirect on 401
			})
			return response?.data || null
		} catch (error) {
			console.error("Token validation request failed:", error)

			if (error instanceof ApiError && error.status === 401) {
				// Handle 401 specifically - token is invalid
				// Token is invalid, remove it
				localStorage.removeItem("auth-token")
				return null
			}

			// For other errors (network issues, etc.), don't remove token
			// as it might be a temporary issue
			return null
		}
	},
}

// Flights API
export const flightsApi = {
	search: async (params: FlightSearchParams): Promise<FlightSearchResponse> => {
		const searchParams = new URLSearchParams()

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				searchParams.append(key, String(value))
			}
		})

		const response = await apiRequest<ApiResponse<FlightSearchResponse>>(
			`/flights?${searchParams.toString()}`,
		)

		if (!response?.data) {
			throw new ApiError("Failed to fetch flights - no response data", 500)
		}

		return response.data
	},

	getById: async (id: string): Promise<Flight> => {
		const response = await apiRequest<ApiResponse<Flight>>(`/flights/${id}`)

		if (!response?.data) {
			throw new ApiError("Failed to fetch flight - no response data", 500)
		}

		return response.data
	},
}

// Bookings API
export const bookingsApi = {
	create: async (booking: CreateBookingRequest): Promise<Booking> => {
		const response = await apiRequest<ApiResponse<Booking>>("/bookings", {
			method: "POST",
			body: JSON.stringify(booking),
		})

		if (!response?.data) {
			throw new ApiError("Failed to create booking - no response data", 500)
		}

		return response.data
	},

	createRoundTrip: async (
		booking: CreateRoundTripBookingRequest,
	): Promise<RoundTripBooking> => {
		const response = await apiRequest<ApiResponse<RoundTripBooking>>(
			"/bookings/round-trip",
			{
				method: "POST",
				body: JSON.stringify(booking),
			},
		)

		if (!response?.data) {
			throw new ApiError(
				"Failed to create round trip booking - no response data",
				500,
			)
		}

		return response.data
	},

	getAll: async (): Promise<BookingWithFlight[]> => {
		const response =
			await apiRequest<ApiResponse<BookingWithFlight[]>>("/bookings")

		if (!response?.data) {
			throw new ApiError("Failed to fetch bookings - no response data", 500)
		}

		return response.data
	},

	getById: async (id: string): Promise<BookingWithFlight> => {
		const response = await apiRequest<ApiResponse<BookingWithFlight>>(
			`/bookings/${id}`,
		)

		if (!response?.data) {
			throw new ApiError("Failed to fetch booking - no response data", 500)
		}

		return response.data
	},

	update: async (
		id: string,
		updates: Partial<CreateBookingRequest>,
	): Promise<Booking> => {
		const response = await apiRequest<ApiResponse<Booking>>(`/bookings/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		})

		if (!response?.data) {
			throw new ApiError("Failed to update booking - no response data", 500)
		}

		return response.data
	},

	delete: async (id: string): Promise<void> => {
		await apiRequest(`/bookings/${id}`, {
			method: "DELETE",
		})
	},
}

// Export all APIs
export const api = {
	auth: authApi,
	flights: flightsApi,
	bookings: bookingsApi,
}
