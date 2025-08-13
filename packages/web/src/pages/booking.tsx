import type { Flight } from "@flight-booking/shared"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { BookingForm } from "@/components/booking/booking-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error"
import { LoadingState } from "@/components/ui/loading"
import { useApi } from "@/hooks/use-api"
import { ProtectedRoute } from "@/hooks/use-auth"
import { api } from "@/lib/api"

export function BookingPage() {
	const location = useLocation()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [flight, setFlight] = useState<Flight | null>(null)
	const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null)
	const [returnFlight, setReturnFlight] = useState<Flight | null>(null)
	const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	// Get flight data from location state or search params
	const flightFromState = location.state?.flight as Flight | undefined
	const outboundFlightFromState = location.state?.outboundFlight as
		| Flight
		| undefined
	const returnFlightFromState = location.state?.returnFlight as
		| Flight
		| undefined
	const isRoundTripFromState = location.state?.isRoundTrip as
		| boolean
		| undefined
	const flightIdFromParams = searchParams.get("flight")

	// Fetch flight data if not provided in state
	const {
		data: fetchedFlight,
		isLoading,
		error: fetchError,
	} = useApi(
		() =>
			flightIdFromParams
				? api.flights.getById(flightIdFromParams)
				: Promise.resolve(null),
		[flightIdFromParams],
	)

	useEffect(() => {
		if (
			outboundFlightFromState &&
			returnFlightFromState &&
			isRoundTripFromState
		) {
			// Round trip booking data passed from search results
			setOutboundFlight(outboundFlightFromState)
			setReturnFlight(returnFlightFromState)
			setIsRoundTrip(true)
			setError(null)
		} else if (flightFromState) {
			// Single flight data passed from search results
			setFlight(flightFromState)
			setIsRoundTrip(false)
			setError(null)
		} else if (fetchedFlight) {
			// Flight data fetched by ID
			setFlight(fetchedFlight)
			setIsRoundTrip(false)
			setError(null)
		} else if (fetchError) {
			setError(fetchError)
		} else if (
			!flightIdFromParams &&
			!flightFromState &&
			!outboundFlightFromState
		) {
			setError(
				"No flight selected. Please select a flight from the search results.",
			)
		}
	}, [
		flightFromState,
		outboundFlightFromState,
		returnFlightFromState,
		isRoundTripFromState,
		fetchedFlight,
		fetchError,
		flightIdFromParams,
	])

	const handleGoBack = () => {
		// Go back to search results or home page
		if (window.history.length > 1) {
			navigate(-1)
		} else {
			navigate("/")
		}
	}

	if (isLoading) {
		return <LoadingState message="Loading flight details..." />
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<ErrorState
					title="Flight Not Found"
					message={error}
					onRetry={() => window.location.reload()}
				/>
				<div className="text-center mt-6">
					<Button onClick={handleGoBack} variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
					</Button>
				</div>
			</div>
		)
	}

	if (!flight && !outboundFlight) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card className="max-w-md mx-auto">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-yellow-500" />
							No Flight Selected
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							Please select a flight from the search results to proceed with
							booking.
						</p>
						<div className="flex gap-2">
							<Button onClick={() => navigate("/")} className="flex-1">
								Search Flights
							</Button>
							<Button onClick={handleGoBack} variant="outline">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<ProtectedRoute>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-6">
					<Button onClick={handleGoBack} variant="ghost" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Search Results
					</Button>
					<h1 className="text-3xl font-bold">Complete Your Booking</h1>
					<p className="text-muted-foreground mt-2">
						Please review your flight details and provide passenger information.
					</p>
				</div>

				{/* Booking Form */}
				<BookingForm
					flight={flight}
					outboundFlight={outboundFlight}
					returnFlight={returnFlight}
					isRoundTrip={isRoundTrip}
				/>
			</div>
		</ProtectedRoute>
	)
}
