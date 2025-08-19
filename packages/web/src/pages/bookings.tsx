// Import removed - using the API method directly
import { ArrowRight, Calendar, Clock, MapPin, Plane, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error"
import { LoadingState } from "@/components/ui/loading"
import { useApi } from "@/hooks/use-api"
import { ProtectedRoute } from "@/hooks/use-auth"
import { api } from "@/lib/api"

export function BookingsPage() {
	const navigate = useNavigate()

	// Fetch user's bookings using the new API
	const {
		data: bookings,
		isLoading,
		error,
		refetch,
	} = useApi(() => api.bookings.getAllWithTrips(), [])

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("ja-JP", {
			style: "currency",
			currency: "JPY",
			minimumFractionDigits: 0,
		}).format(price)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		})
	}

	const formatDateTime = (dateString: string) => {
		// The database stores timestamps in Asia/Shanghai timezone but marks them as UTC
		// We need to adjust for this by subtracting 8 hours to get the actual UTC time
		const date = new Date(dateString)
		const adjustedDate = new Date(date.getTime() - 8 * 60 * 60 * 1000) // Subtract 8 hours

		return adjustedDate.toLocaleString("en-US", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		})
	}

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
	}

	// Sort bookings by creation date (newest first)
	const sortedBookings =
		bookings?.sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		) || []

	if (isLoading) {
		return <LoadingState message="Loading your bookings..." />
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<ErrorState
					title="Failed to Load Bookings"
					message={error}
					onRetry={refetch}
				/>
			</div>
		)
	}

	return (
		<ProtectedRoute>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold">My Bookings</h1>
					<p className="text-muted-foreground mt-2">
						Manage your flight reservations and travel plans.
					</p>
				</div>

				{/* Bookings List */}
				{sortedBookings.length === 0 ? (
					<Card className="max-w-2xl mx-auto">
						<CardContent className="text-center py-12">
							<Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
							<p className="text-muted-foreground mb-6">
								You haven't made any flight bookings yet. Start planning your
								next trip!
							</p>
							<Button onClick={() => navigate("/")}>Search Flights</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{sortedBookings.map((booking) => (
							<Card key={booking.id} className="overflow-hidden">
								<CardHeader className="pb-4">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg">
												Booking #{booking.id.slice(-8).toUpperCase()}
												{booking.trip_type === "round_trip" && (
													<span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
														Round Trip
													</span>
												)}
												{booking.trip_type === "multi_stop" && (
													<span className="ml-2 text-sm font-normal text-purple-600 bg-purple-50 px-2 py-1 rounded">
														Multi-Stop
													</span>
												)}
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												Booked on {formatDateTime(booking.created_at)}
											</p>
										</div>
										<div className="text-right">
											<div className="px-3 py-1 rounded-full text-xs font-medium border bg-green-50 border-green-200 text-green-800 mb-2">
												CONFIRMED
											</div>
											<div className="text-right">
												<p className="text-xl font-bold text-primary">
													{formatPrice(Number(booking.total_price))}
												</p>
												<p className="text-sm text-muted-foreground">
													Total Price
												</p>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Display all trips */}
									{booking.trips.map((trip, tripIndex) => (
										<div key={trip.id} className="space-y-4">
											{/* Trip header */}
											{booking.trips.length > 1 && (
												<div className="flex items-center gap-2 mb-4">
													<h3 className="font-semibold text-lg">
														{booking.trip_type === "round_trip"
															? tripIndex === 0
																? "Outbound Flight"
																: "Return Flight"
															: `Flight ${tripIndex + 1}`}
													</h3>
													<div className="text-sm text-muted-foreground">
														{formatPrice(Number(trip.total_price))}
													</div>
												</div>
											)}

											{/* Display all flights in this trip */}
											{trip.flights.map((flight, flightIndex) => (
												<div
													key={flight.id}
													className="bg-muted/50 rounded-lg p-4"
												>
													<div className="flex items-center justify-between mb-3">
														<h4 className="font-semibold text-lg">
															{trip.flights.length > 1 && (
																<span className="text-sm font-normal text-muted-foreground mr-2">
																	Flight {flightIndex + 1}:
																</span>
															)}
															{flight.airline} {flight.flight_number}
														</h4>
														<div className="text-right">
															<p className="text-xl font-bold text-primary">
																{formatPrice(Number(flight.price))}
															</p>
															<p className="text-sm text-muted-foreground">
																per person
															</p>
														</div>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														<div className="flex items-center gap-2">
															<MapPin className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="font-medium">
																	{flight.source_airport} →{" "}
																	{flight.destination_airport}
																</p>
																<p className="text-sm text-muted-foreground">
																	Route
																</p>
															</div>
														</div>
														<div className="flex items-center gap-2">
															<Calendar className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="font-medium">
																	{formatDate(flight.departure_date)}
																</p>
																<p className="text-sm text-muted-foreground">
																	Departure Date
																</p>
															</div>
														</div>
														<div className="flex items-center gap-2">
															<Clock className="h-4 w-4 text-muted-foreground" />
															<div>
																<p className="font-medium">
																	{formatTime(flight.departure_time)} -{" "}
																	{formatTime(flight.arrival_time)}
																</p>
																<p className="text-sm text-muted-foreground">
																	Flight Time
																</p>
															</div>
														</div>
													</div>

													{/* Show connecting flight indicator */}
													{flightIndex < trip.flights.length - 1 && (
														<div className="flex items-center justify-center mt-4 pt-4 border-t">
															<div className="flex items-center gap-2 text-sm text-muted-foreground">
																<ArrowRight className="h-4 w-4" />
																<span>Connecting Flight</span>
																<ArrowRight className="h-4 w-4" />
															</div>
														</div>
													)}
												</div>
											))}
										</div>
									))}

									{/* Passenger information */}
									<div className="pt-4 border-t flex items-center gap-2">
										<User className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium">{booking.fullname}</p>
											<p className="text-sm text-muted-foreground">
												{booking.email}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</ProtectedRoute>
	)
}
