import type { Flight } from "@flight-booking/shared"
import { act, renderHook } from "@testing-library/react"
import {
	RoundTripBookingProvider,
	useRoundTripBooking,
} from "../use-round-trip-booking"

// Mock flight data
const mockOutboundFlight: Flight = {
	id: "outbound-1",
	airline: "Test Airlines",
	flight_number: "TA001",
	source: "Tokyo (NRT)",
	destination: "Osaka (KIX)",
	departure_time: "2025-08-06T00:57:00Z",
	arrival_time: "2025-08-06T02:27:00Z",
	departure_date: "2025-08-06",
	arrival_date: "2025-08-06",
	price: 46666,
	is_round_trip: false,
	created_at: "2025-08-05T00:00:00Z",
	updated_at: "2025-08-05T00:00:00Z",
}

const mockReturnFlight: Flight = {
	id: "return-1",
	airline: "ANA",
	flight_number: "NH115",
	source: "Osaka (KIX)",
	destination: "Tokyo (NRT)",
	departure_time: "2025-08-10T14:45:00Z",
	arrival_time: "2025-08-10T16:15:00Z",
	departure_date: "2025-08-10",
	arrival_date: "2025-08-10",
	price: 43407,
	is_round_trip: false,
	created_at: "2025-08-09T00:00:00Z",
	updated_at: "2025-08-09T00:00:00Z",
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<RoundTripBookingProvider>{children}</RoundTripBookingProvider>
)

describe("useRoundTripBooking", () => {
	it("should initialize with default values", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		expect(result.current.isRoundTrip).toBe(false)
		expect(result.current.selectedOutboundFlight).toBe(null)
		expect(result.current.selectedReturnFlight).toBe(null)
		expect(result.current.currentStep).toBe("select_outbound")
		expect(result.current.outboundFlights).toEqual([])
		expect(result.current.returnFlights).toEqual([])
	})

	it("should set round trip mode", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.setIsRoundTrip(true)
		})

		expect(result.current.isRoundTrip).toBe(true)
		expect(result.current.currentStep).toBe("select_outbound")
		expect(result.current.selectedOutboundFlight).toBe(null)
		expect(result.current.selectedReturnFlight).toBe(null)
	})

	it("should handle outbound flight selection in round trip mode", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.setIsRoundTrip(true)
		})

		act(() => {
			result.current.selectOutboundFlight(mockOutboundFlight)
		})

		expect(result.current.selectedOutboundFlight).toEqual(mockOutboundFlight)
		expect(result.current.currentStep).toBe("select_return")
		expect(result.current.selectedReturnFlight).toBe(null)
	})

	it("should handle return flight selection", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.setIsRoundTrip(true)
		})

		act(() => {
			result.current.selectOutboundFlight(mockOutboundFlight)
		})

		act(() => {
			result.current.selectReturnFlight(mockReturnFlight)
		})

		expect(result.current.selectedReturnFlight).toEqual(mockReturnFlight)
		expect(result.current.currentStep).toBe("booking")
	})

	it("should handle one-way flight selection", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.selectOutboundFlight(mockOutboundFlight)
		})

		expect(result.current.selectedOutboundFlight).toEqual(mockOutboundFlight)
		expect(result.current.currentStep).toBe("booking")
		expect(result.current.selectedReturnFlight).toBe(null)
	})

	it("should reset booking state", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.setIsRoundTrip(true)
			result.current.selectOutboundFlight(mockOutboundFlight)
			result.current.selectReturnFlight(mockReturnFlight)
		})

		act(() => {
			result.current.resetBooking()
		})

		expect(result.current.selectedOutboundFlight).toBe(null)
		expect(result.current.selectedReturnFlight).toBe(null)
		expect(result.current.currentStep).toBe("select_outbound")
	})

	it("should clear outbound selection and reset to select_outbound", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.setIsRoundTrip(true)
			result.current.selectOutboundFlight(mockOutboundFlight)
			result.current.selectReturnFlight(mockReturnFlight)
		})

		act(() => {
			result.current.clearOutboundSelection()
		})

		expect(result.current.selectedOutboundFlight).toBe(null)
		expect(result.current.selectedReturnFlight).toBe(null)
		expect(result.current.currentStep).toBe("select_outbound")
	})

	it("should clear return selection and go back to select_return", () => {
		const { result } = renderHook(() => useRoundTripBooking(), { wrapper })

		act(() => {
			result.current.setIsRoundTrip(true)
			result.current.selectOutboundFlight(mockOutboundFlight)
			result.current.selectReturnFlight(mockReturnFlight)
		})

		act(() => {
			result.current.clearReturnSelection()
		})

		expect(result.current.selectedOutboundFlight).toEqual(mockOutboundFlight)
		expect(result.current.selectedReturnFlight).toBe(null)
		expect(result.current.currentStep).toBe("select_return")
	})
})
