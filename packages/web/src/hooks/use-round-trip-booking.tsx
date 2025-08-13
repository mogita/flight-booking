import type { Flight } from "@flight-booking/shared"
import { createContext, type ReactNode, useContext, useState } from "react"

export type RoundTripBookingStep =
	| "select_outbound"
	| "select_return"
	| "booking"

interface RoundTripBookingState {
	isRoundTrip: boolean
	selectedOutboundFlight: Flight | null
	selectedReturnFlight: Flight | null
	currentStep: RoundTripBookingStep
	outboundFlights: Flight[]
	returnFlights: Flight[]
}

interface RoundTripBookingActions {
	setIsRoundTrip: (isRoundTrip: boolean) => void
	setOutboundFlights: (flights: Flight[]) => void
	setReturnFlights: (flights: Flight[]) => void
	selectOutboundFlight: (flight: Flight) => void
	selectReturnFlight: (flight: Flight) => void
	clearOutboundSelection: () => void
	clearReturnSelection: () => void
	resetBooking: () => void
	proceedToBooking: () => void
}

interface RoundTripBookingContextType
	extends RoundTripBookingState,
		RoundTripBookingActions {}

const RoundTripBookingContext = createContext<
	RoundTripBookingContextType | undefined
>(undefined)

interface RoundTripBookingProviderProps {
	children: ReactNode
}

export function RoundTripBookingProvider({
	children,
}: RoundTripBookingProviderProps) {
	const [state, setState] = useState<RoundTripBookingState>({
		isRoundTrip: false,
		selectedOutboundFlight: null,
		selectedReturnFlight: null,
		currentStep: "select_outbound",
		outboundFlights: [],
		returnFlights: [],
	})

	const setIsRoundTrip = (isRoundTrip: boolean) => {
		setState((prev) => ({
			...prev,
			isRoundTrip,
			currentStep: isRoundTrip ? "select_outbound" : "select_outbound",
			selectedOutboundFlight: null,
			selectedReturnFlight: null,
		}))
	}

	const setOutboundFlights = (flights: Flight[]) => {
		setState((prev) => ({ ...prev, outboundFlights: flights }))
	}

	const setReturnFlights = (flights: Flight[]) => {
		setState((prev) => ({ ...prev, returnFlights: flights }))
	}

	const selectOutboundFlight = (flight: Flight) => {
		setState((prev) => ({
			...prev,
			selectedOutboundFlight: flight,
			currentStep: prev.isRoundTrip ? "select_return" : "booking",
		}))
	}

	const selectReturnFlight = (flight: Flight) => {
		setState((prev) => ({
			...prev,
			selectedReturnFlight: flight,
			currentStep: "booking",
		}))
	}

	const clearOutboundSelection = () => {
		setState((prev) => ({
			...prev,
			selectedOutboundFlight: null,
			selectedReturnFlight: null,
			currentStep: "select_outbound",
		}))
	}

	const clearReturnSelection = () => {
		setState((prev) => ({
			...prev,
			selectedReturnFlight: null,
			currentStep: "select_return",
		}))
	}

	const resetBooking = () => {
		setState((prev) => ({
			...prev,
			selectedOutboundFlight: null,
			selectedReturnFlight: null,
			currentStep: "select_outbound",
		}))
	}

	const proceedToBooking = () => {
		setState((prev) => ({ ...prev, currentStep: "booking" }))
	}

	const value: RoundTripBookingContextType = {
		...state,
		setIsRoundTrip,
		setOutboundFlights,
		setReturnFlights,
		selectOutboundFlight,
		selectReturnFlight,
		clearOutboundSelection,
		clearReturnSelection,
		resetBooking,
		proceedToBooking,
	}

	return (
		<RoundTripBookingContext.Provider value={value}>
			{children}
		</RoundTripBookingContext.Provider>
	)
}

export function useRoundTripBooking() {
	const context = useContext(RoundTripBookingContext)
	if (context === undefined) {
		throw new Error(
			"useRoundTripBooking must be used within a RoundTripBookingProvider",
		)
	}
	return context
}
