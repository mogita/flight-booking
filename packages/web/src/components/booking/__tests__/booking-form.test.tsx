import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { BookingForm } from '../booking-form'
import { AuthProvider } from '@/hooks/use-auth'
import type { Flight } from '@flight-booking/shared'

// Mock the auth hook to return an authenticated user
vi.mock('@/hooks/use-auth', async () => {
  const actual = await vi.importActual('@/hooks/use-auth')
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      error: null,
      clearError: vi.fn(),
    }),
  }
})

const mockFlight: Flight = {
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
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('BookingForm', () => {
  it('renders flight summary correctly', () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    expect(screen.getByText('Japan Airlines JL123')).toBeInTheDocument()
    expect(screen.getByText('NRT → KIX')).toBeInTheDocument()
    expect(screen.getByText('￥25,000')).toBeInTheDocument()
  })

  it('shows passenger details form initially', () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    expect(screen.getByText('Passenger Details')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/full name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('sanitizes input values', async () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    const nameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(nameInput, { target: { value: 'John<script>alert("xss")</script>Doe' } })

    await waitFor(() => {
      expect(nameInput).toHaveValue('JohnscriptalertxssscriptDoe')
    })
  })

  it('shows security notice', () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    expect(screen.getByText(/your information is encrypted and secure/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('validates phone number format', async () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    const phoneInput = screen.getByLabelText(/phone number/i)
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } })
    fireEvent.blur(phoneInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
    })
  })

  it('shows payment form after valid details', async () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    // Fill valid details including optional phone field
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+1234567890' }
    })

    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Payment Information')).toBeInTheDocument()
      expect(screen.getByText(/this is a demo/i)).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('formats card number with spaces', async () => {
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    // Navigate to payment step first
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+1234567890' }
    })
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }))

    await waitFor(() => {
      const cardInput = screen.getByLabelText(/card number/i)
      fireEvent.change(cardInput, { target: { value: '1234567890123456' } })

      expect(cardInput).toHaveValue('1234 5678 9012 3456')
    }, { timeout: 10000 })
  })

  it('shows confirmation after successful booking', async () => {
    vi.useFakeTimers()
    
    render(
      <TestWrapper>
        <BookingForm flight={mockFlight} />
      </TestWrapper>
    )

    // Fill details and proceed to payment
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }))

    await waitFor(() => {
      // Fill payment details
      fireEvent.change(screen.getByLabelText(/card number/i), { 
        target: { value: '1234567890123456' } 
      })
      fireEvent.change(screen.getByLabelText(/expiry date/i), { 
        target: { value: '12/25' } 
      })
      fireEvent.change(screen.getByLabelText(/cvv/i), { 
        target: { value: '123' } 
      })
      fireEvent.change(screen.getByLabelText(/cardholder name/i), { 
        target: { value: 'John Doe' } 
      })
    })

    const completeButton = screen.getByRole('button', { name: /complete booking/i })
    fireEvent.click(completeButton)

    // Fast-forward timers to simulate async operations
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })
})
