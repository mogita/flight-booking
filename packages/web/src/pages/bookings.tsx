import type { BookingWithFlight } from "@flight-booking/shared"
import { ArrowRight, Calendar, Clock, MapPin, Plane, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error"
import { LoadingState } from "@/components/ui/loading"
import { useApi } from "@/hooks/use-api"
import { ProtectedRoute, useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"

// Group bookings by round trip
interface GroupedBooking {
	id: string
	type: "one_way" | "round_trip"
	bookings: BookingWithFlight[]
	round_trip_booking_id?: string
	created_at: string
}

export function BookingsPage() {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [bookings, setBookings] = useState<BookingWithFlight[]>([])
	const [groupedBookings, setGroupedBookings] = useState<GroupedBooking[]>([])

	// Fetch user's bookings
	const {
		data: fetchedBookings,
		isLoading,
		error,
		refetch,
	} = useApi(() => api.bookings.getAll(), [])

	useEffect(() => {
		if (fetchedBookings) {
			setBookings(fetchedBookings)

			// Group bookings by round trip
			const grouped: GroupedBooking[] = []
			const processedRoundTripIds = new Set<string>()

			fetchedBookings.forEach((booking) => {
				if (
					booking.booking_type === "round_trip" &&
					booking.round_trip_booking_id
				) {
					// Skip if we've already processed this round trip
					if (processedRoundTripIds.has(booking.round_trip_booking_id)) {
						return
					}

					// Find all bookings with the same round trip ID
					const roundTripBookings = fetchedBookings.filter(
						(b) => b.round_trip_booking_id === booking.round_trip_booking_id,
					)

					// Sort by departure time to ensure outbound comes first
					roundTripBookings.sort(
						(a, b) =>
							new Date(a.flight.departure_time).getTime() -
							new Date(b.flight.departure_time).getTime(),
					)

					grouped.push({
						id: booking.round_trip_booking_id,
						type: "round_trip",
						bookings: roundTripBookings,
						round_trip_booking_id: booking.round_trip_booking_id,
						created_at: booking.created_at,
					})

					processedRoundTripIds.add(booking.round_trip_booking_id)
				} else if (
					booking.booking_type === "one_way" ||
					!booking.round_trip_booking_id
				) {
					// Single booking
					grouped.push({
						id: booking.id,
						type: "one_way",
						bookings: [booking],
						created_at: booking.created_at,
					})
				}
			})

			// Sort grouped bookings by creation date (newest first)
			grouped.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			)

			setGroupedBookings(grouped)
		}
	}, [fetchedBookings])

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

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "confirmed":
				return "text-green-600 bg-green-50 border-green-200"
			case "pending":
				return "text-yellow-600 bg-yellow-50 border-yellow-200"
			case "cancelled":
				return "text-red-600 bg-red-50 border-red-200"
			default:
				return "text-gray-600 bg-gray-50 border-gray-200"
		}
	}

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
				{groupedBookings.length === 0 ? (
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
						{groupedBookings.map((group) => (
							<Card key={group.id} className="overflow-hidden">
								<CardHeader className="pb-4">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg">
												Booking #
												{group.type === "round_trip"
													? group.id.slice(-8).toUpperCase()
													: group.bookings[0].id.slice(-8).toUpperCase()}
												{group.type === "round_trip" && (
													<span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
														Round Trip
													</span>
												)}
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												Booked on {formatDateTime(group.created_at)}
											</p>
										</div>
										<div className="px-3 py-1 rounded-full text-xs font-medium border bg-green-50 border-green-200 text-green-800">
											CONFIRMED
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{group.type === "round_trip" ? (
										// Round trip display
										<div className="space-y-4">
											{group.bookings.map((booking, index) => (
												<div
													key={booking.id}
													className="bg-muted/50 rounded-lg p-4"
												>
													<div className="flex items-center justify-between mb-3">
														<h4 className="font-semibold text-lg">
															<span className="text-sm font-normal text-muted-foreground mr-2">
																{index === 0 ? "Outbound:" : "Return:"}
															</span>
															{booking.flight?.airline}{" "}
															{booking.flight?.flight_number}
														</h4>
														<div className="text-right">
															<p className="text-xl font-bold text-primary">
																{formatPrice(
																	Number(booking.flight?.price || 0),
																)}
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
																	{booking.flight?.source} →{" "}
																	{booking.flight?.destination}
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
																	{booking.flight?.departure_date &&
																		formatDate(booking.flight.departure_date)}
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
																	{booking.flight?.departure_time &&
																		formatTime(
																			booking.flight.departure_time,
																		)}{" "}
																	-{" "}
																	{booking.flight?.arrival_time &&
																		formatTime(booking.flight.arrival_time)}
																</p>
																<p className="text-sm text-muted-foreground">
																	Flight Time
																</p>
															</div>
														</div>
													</div>

													<div className="mt-4 pt-4 border-t flex items-center gap-2">
														<User className="h-4 w-4 text-muted-foreground" />
														<div>
															<p className="font-medium">{booking.fullname}</p>
															<p className="text-sm text-muted-foreground">
																{booking.email}
															</p>
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										// Single booking display
										<div className="space-y-4">
											<div className="bg-muted/50 rounded-lg p-4">
												<div className="flex items-center justify-between mb-3">
													<h4 className="font-semibold text-lg">
														{group.bookings[0].flight?.airline}{" "}
														{group.bookings[0].flight?.flight_number}
													</h4>
													<div className="text-right">
														<p className="text-2xl font-bold text-primary">
															{formatPrice(
																Number(group.bookings[0].flight?.price || 0),
															)}
														</p>
														<p className="text-sm text-muted-foreground">
															Total
														</p>
													</div>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-muted-foreground" />
														<div>
															<p className="font-medium">
																{group.bookings[0].flight?.source} →{" "}
																{group.bookings[0].flight?.destination}
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
																{group.bookings[0].flight?.departure_date &&
																	formatDate(
																		group.bookings[0].flight.departure_date,
																	)}
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
																{group.bookings[0].flight?.departure_time &&
																	formatTime(
																		group.bookings[0].flight.departure_time,
																	)}{" "}
																-{" "}
																{group.bookings[0].flight?.arrival_time &&
																	formatTime(
																		group.bookings[0].flight.arrival_time,
																	)}
															</p>
															<p className="text-sm text-muted-foreground">
																Flight Time
															</p>
														</div>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<User className="h-4 w-4 text-muted-foreground" />
												<div>
													<p className="font-medium">
														{group.bookings[0].fullname}
													</p>
													<p className="text-sm text-muted-foreground">
														{group.bookings[0].email}
													</p>
												</div>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</ProtectedRoute>
	)
}
