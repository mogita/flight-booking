import type { 
  Flight, 
  FlightSearchParams, 
  FlightSearchResponse,
  Booking,
  CreateBookingRequest,
  BookingWithFlight,
  LoginRequest,
  LoginResponse,
  ApiResponse 
} from '@flight-booking/shared'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = localStorage.getItem('auth-token')
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
      throw new ApiError(
        data.error || data.message || 'An error occurred',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    throw new ApiError(
      'Network error. Please check your connection.',
      0,
      error
    )
  }
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    // Store token in localStorage
    if (response.data?.token) {
      localStorage.setItem('auth-token', response.data.token)
    }
    
    return response.data!
  },

  logout: () => {
    localStorage.removeItem('auth-token')
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth-token')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth-token')
  },
}

// Flights API
export const flightsApi = {
  search: async (params: FlightSearchParams): Promise<FlightSearchResponse> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    const response = await apiRequest<ApiResponse<FlightSearchResponse>>(
      `/flights?${searchParams.toString()}`
    )
    
    return response.data!
  },

  getById: async (id: string): Promise<Flight> => {
    const response = await apiRequest<ApiResponse<Flight>>(`/flights/${id}`)
    return response.data!
  },
}

// Bookings API
export const bookingsApi = {
  create: async (booking: CreateBookingRequest): Promise<Booking> => {
    const response = await apiRequest<ApiResponse<Booking>>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    })
    return response.data!
  },

  getAll: async (): Promise<BookingWithFlight[]> => {
    const response = await apiRequest<ApiResponse<BookingWithFlight[]>>('/bookings')
    return response.data!
  },

  getById: async (id: string): Promise<BookingWithFlight> => {
    const response = await apiRequest<ApiResponse<BookingWithFlight>>(`/bookings/${id}`)
    return response.data!
  },

  update: async (id: string, updates: Partial<CreateBookingRequest>): Promise<Booking> => {
    const response = await apiRequest<ApiResponse<Booking>>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response.data!
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    })
  },
}

// Export all APIs
export const api = {
  auth: authApi,
  flights: flightsApi,
  bookings: bookingsApi,
}
