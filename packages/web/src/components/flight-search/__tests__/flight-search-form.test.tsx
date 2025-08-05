import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FlightSearchForm } from '../flight-search-form'

// Mock the date picker component
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ onChange, placeholder }: any) => (
    <input
      data-testid="date-picker"
      placeholder={placeholder}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
    />
  ),
}))

describe('FlightSearchForm', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  it('renders all form fields', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    expect(screen.getByLabelText(/from/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/departure/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument()
  })

  it('shows round trip toggle', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    expect(screen.getByLabelText(/one way/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/round trip/i)).toBeInTheDocument()
  })

  it('shows return date field when round trip is selected', async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    const roundTripRadio = screen.getByLabelText(/round trip/i)
    fireEvent.click(roundTripRadio)

    await waitFor(() => {
      expect(screen.getByLabelText(/return/i)).toBeInTheDocument()
    })
  })

  it('shows popular destinations', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    expect(screen.getByText(/popular destinations/i)).toBeInTheDocument()
    expect(screen.getByText(/from tokyo/i)).toBeInTheDocument()
    expect(screen.getByText(/to osaka/i)).toBeInTheDocument()
  })

  it('allows quick selection of destinations', async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    const tokyoButton = screen.getByText(/from tokyo/i)
    fireEvent.click(tokyoButton)

    const sourceInput = screen.getByLabelText(/from/i) as HTMLInputElement
    await waitFor(() => {
      expect(sourceInput.value).toBe('Tokyo (NRT)')
    })
  })

  it('has swap cities functionality', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    const swapButton = screen.getByTitle(/swap cities/i)
    expect(swapButton).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    const submitButton = screen.getByRole('button', { name: /search flights/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/source city is required/i)).toBeInTheDocument()
      expect(screen.getByText(/destination city is required/i)).toBeInTheDocument()
    })
  })

  it('shows loading state when searching', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /searching/i })
    expect(submitButton).toBeDisabled()
  })

  it('has reset functionality', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />)

    const resetButton = screen.getByRole('button', { name: /reset/i })
    expect(resetButton).toBeInTheDocument()
  })
})
