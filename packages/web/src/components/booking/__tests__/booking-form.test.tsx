import type { Flight } from "@flight-booking/shared"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider } from "@/hooks/use-auth"
import { BookingForm } from "../booking-form"

// Mock the auth hook to return an authenticated user
vi.mock("@/hooks/use-auth", async () => {
	const actual = await vi.importActual("@/hooks/use-auth")
	return {
		...actual,
		useAuth: () => ({
			user: { id: "1", username: "testuser", email: "test@example.com" },
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
	<BrowserRouter>
		<AuthProvider>{children}</AuthProvider>
	</BrowserRouter>
)

describe("BookingForm", () => {
	it("renders flight summary correctly", () => {
		render(
			<TestWrapper>
				<BookingForm flight={mockFlight} />
			</TestWrapper>,
		)

		expect(screen.getByText("Japan Airlines JL123")).toBeInTheDocument()
		expect(screen.getByText("NRT → KIX")).toBeInTheDocument()
		expect(screen.getByText("￥25,000")).toBeInTheDocument()
	})

	it("shows passenger details form initially", () => {
		render(
			<TestWrapper>
				<BookingForm flight={mockFlight} />
			</TestWrapper>,
		)

		expect(screen.getByText("Passenger Details")).toBeInTheDocument()
		expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
	})

	it("sanitizes input values", async () => {
		render(
			<TestWrapper>
				<BookingForm flight={mockFlight} />
			</TestWrapper>,
		)

		const nameInput = screen.getByLabelText(/full name/i)
		fireEvent.change(nameInput, {
			target: { value: 'John<script>alert("xss")</script>Doe' },
		})

		await waitFor(() => {
			expect(nameInput).toHaveValue("Johnscriptalert(xss)/scriptDoe")
		})
	})

	it("shows payment form after valid details", async () => {
		render(
			<TestWrapper>
				<BookingForm flight={mockFlight} />
			</TestWrapper>,
		)

		// Fill valid details including optional phone field
		fireEvent.change(screen.getByLabelText(/full name/i), {
			target: { value: "John Doe" },
		})
		fireEvent.change(screen.getByLabelText(/email address/i), {
			target: { value: "john@example.com" },
		})
		fireEvent.change(screen.getByLabelText(/phone number/i), {
			target: { value: "+1234567890" },
		})

		const submitButton = screen.getByRole("button", {
			name: /continue to payment/i,
		})
		fireEvent.click(submitButton)

		await waitFor(
			() => {
				expect(screen.getByText("Payment Information")).toBeInTheDocument()
				expect(screen.getByText(/this is a demo/i)).toBeInTheDocument()
			},
			{ timeout: 10000 },
		)
	})

	it("formats card number with spaces", async () => {
		render(
			<TestWrapper>
				<BookingForm flight={mockFlight} />
			</TestWrapper>,
		)

		// Navigate to payment step first
		fireEvent.change(screen.getByLabelText(/full name/i), {
			target: { value: "John Doe" },
		})
		fireEvent.change(screen.getByLabelText(/email address/i), {
			target: { value: "john@example.com" },
		})
		fireEvent.change(screen.getByLabelText(/phone number/i), {
			target: { value: "+1234567890" },
		})
		fireEvent.click(
			screen.getByRole("button", { name: /continue to payment/i }),
		)

		await waitFor(
			() => {
				const cardInput = screen.getByLabelText(/card number/i)
				fireEvent.change(cardInput, { target: { value: "1234567890123456" } })

				expect(cardInput).toHaveValue("1234 5678 9012 3456")
			},
			{ timeout: 10000 },
		)
	})
})
