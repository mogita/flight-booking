import type { Flight } from "@flight-booking/shared"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FlightCard } from "../flight-card"

const mockFlight: Flight = {
	id: "1",
	airline: "Japan Airlines",
	flight_number: "JL123",
	departure_time: "2024-08-06T08:00:00Z",
	arrival_time: "2024-08-06T09:30:00Z",
	price: 25000,
	source: "NRT",
	destination: "KIX",
	departure_date: "2024-08-06",
	arrival_date: "2024-08-06",
	is_round_trip: false,
	created_at: "2024-08-05T00:00:00Z",
	updated_at: "2024-08-05T00:00:00Z",
}

describe("FlightCard", () => {
	const mockOnBook = vi.fn()

	beforeEach(() => {
		mockOnBook.mockClear()
	})

	it("renders flight information correctly", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		expect(screen.getByText("Japan Airlines")).toBeInTheDocument()
		expect(screen.getByText("JL123")).toBeInTheDocument()
		expect(screen.getByText("NRT")).toBeInTheDocument()
		expect(screen.getByText("KIX")).toBeInTheDocument()
	})

	it("displays formatted times", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		// Times should be formatted as HH:mm (converted from UTC to local time)
		// UTC 08:00 becomes local time (depends on timezone, but in JST it would be 17:00)
		// We'll check for the actual rendered times instead of hardcoded values
		const timeElements = screen.getAllByText(/^\d{2}:\d{2}$/)
		expect(timeElements).toHaveLength(2) // departure and arrival times
	})

	it("displays formatted dates", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		// Dates should be formatted as MMM dd (appears twice - departure and arrival)
		const dateElements = screen.getAllByText("Aug 06")
		expect(dateElements).toHaveLength(2) // departure and arrival dates
	})

	it("calculates and displays flight duration", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		// Duration should be calculated as 1h 30m
		expect(screen.getByText("1h 30m")).toBeInTheDocument()
	})

	it("formats price in Japanese Yen", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		// Price should be formatted as Japanese Yen (using full-width yen symbol)
		expect(screen.getByText("￥25,000")).toBeInTheDocument()
	})

	it("shows rating when showRating is true", () => {
		render(
			<FlightCard flight={mockFlight} onBook={mockOnBook} showRating={true} />,
		)

		// Should show a rating (generated from flight number)
		const ratingElement = screen.getByText(/\d\.\d/)
		expect(ratingElement).toBeInTheDocument()
	})

	it("hides rating when showRating is false", () => {
		render(
			<FlightCard flight={mockFlight} onBook={mockOnBook} showRating={false} />,
		)

		// Should not show rating
		const starIcon = screen.queryByTestId("star-icon")
		expect(starIcon).not.toBeInTheDocument()
	})

	it("shows direct flight indicator", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		expect(screen.getByText("Direct flight")).toBeInTheDocument()
	})

	it("shows round trip indicator when applicable", () => {
		const roundTripFlight = { ...mockFlight, is_round_trip: true }
		render(<FlightCard flight={roundTripFlight} onBook={mockOnBook} />)

		expect(screen.getByText("Round trip")).toBeInTheDocument()
	})

	it("calls onBook when book button is clicked", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		const bookButton = screen.getByRole("button", { name: /book flight/i })
		fireEvent.click(bookButton)

		expect(mockOnBook).toHaveBeenCalledWith(mockFlight)
		expect(mockOnBook).toHaveBeenCalledTimes(1)
	})

	it("applies custom className", () => {
		const { container } = render(
			<FlightCard
				flight={mockFlight}
				onBook={mockOnBook}
				className="custom-class"
			/>,
		)

		const cardElement = container.firstChild as HTMLElement
		expect(cardElement).toHaveClass("custom-class")
	})

	it("has proper accessibility attributes", () => {
		render(<FlightCard flight={mockFlight} onBook={mockOnBook} />)

		const bookButton = screen.getByRole("button", { name: /book flight/i })
		expect(bookButton).toBeInTheDocument()
		expect(bookButton).not.toBeDisabled()
	})
})
