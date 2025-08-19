import type { Flight, FlightSearchResponse } from "@flight-booking/shared"
import { Filter, Plane } from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error"
import { FlightCardSkeleton } from "@/components/ui/loading"
import { Pagination, PaginationInfo } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"

type RoundTripBookingStep = "select_outbound" | "select_return" | "booking"

import { cn } from "@/lib/utils"
import { FlightCard } from "./flight-card"

interface FlightSearchResultsProps {
	results: FlightSearchResponse | null
	isLoading: boolean
	error: string | null
	onBookFlight: (flight: Flight) => void
	onPageChange?: (page: number) => void
	onSortChange?: (sortBy: SortOption) => void
	className?: string
	// Round trip booking props
	selectedFlight?: Flight | null
	isRoundTrip?: boolean
	currentStep?: RoundTripBookingStep
	flightType?: "outbound" | "return" // New prop to distinguish flight type
}

type SortOption =
	| "price_asc"
	| "price_desc"
	| "departure_asc"
	| "departure_desc"
	| "duration_asc"

const SORT_OPTIONS = [
	{ value: "price_asc", label: "Price: Low to High" },
	{ value: "price_desc", label: "Price: High to Low" },
	{ value: "departure_asc", label: "Departure: Early to Late" },
	{ value: "departure_desc", label: "Departure: Late to Early" },
	{ value: "duration_asc", label: "Duration: Shortest First" },
]

export function FlightSearchResults({
	results,
	isLoading,
	error,
	onBookFlight,
	onPageChange,
	onSortChange,
	className,
	selectedFlight,
	isRoundTrip = false,
	currentStep = "select_outbound",
	flightType = "outbound",
}: FlightSearchResultsProps) {
	const [sortBy, setSortBy] = useState<SortOption>("price_asc")

	const handleSortChange = (newSortBy: SortOption) => {
		setSortBy(newSortBy)
		onSortChange?.(newSortBy)
	}

	if (isLoading && !results) {
		return (
			<div className={cn("space-y-4", className)}>
				<div className="flex justify-between items-center">
					<div className="h-6 w-32 bg-muted animate-pulse rounded" />
					<div className="h-10 w-48 bg-muted animate-pulse rounded" />
				</div>
				{Array.from({ length: 3 }).map((_, i) => (
					<FlightCardSkeleton key={i} />
				))}
			</div>
		)
	}

	if (error) {
		return (
			<ErrorState title="Search Failed" message={error} className={className} />
		)
	}

	if (!results) {
		return null
	}

	const { flights = [] } = results
	const {
		total = 0,
		page = 1,
		totalPages: total_pages = 1,
		limit = 10,
	} = results.pagination || {}

	if (flights.length === 0) {
		return (
			<Card className={cn("text-center py-12", className)}>
				<CardContent>
					<Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No Flights Found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria or dates to find available
						flights.
					</p>
				</CardContent>
			</Card>
		)
	}

	// Flights are now sorted on the server side, so we use them directly

	return (
		<div className={cn("space-y-6", className)}>
			{/* Results Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold">Flight Results</h2>
					<p className="text-muted-foreground">
						{total || 0} flights found
						{total_pages > 1 ? ` • Page ${page || 1} of ${total_pages}` : ""}
					</p>
				</div>

				{/* Sort Controls */}
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<Select
						value={sortBy}
						onChange={(e) => handleSortChange(e.target.value as SortOption)}
					>
						{SORT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</div>
			</div>

			{/* Pagination Info */}
			<PaginationInfo
				currentPage={page || 1}
				totalPages={total_pages || 1}
				totalItems={total || 0}
				itemsPerPage={limit || 10}
				className="text-center"
			/>

			{/* Flight Cards */}
			<div className="space-y-6">
				{flights.map((flight) => {
					const isSelected = selectedFlight?.id === flight.id

					// Determine if this flight should be disabled
					let isDisabled = false
					let effectiveStep = currentStep

					if (isRoundTrip) {
						if (flightType === "return") {
							// Return flights are disabled until outbound is selected
							isDisabled = currentStep === "select_outbound"
							effectiveStep = "select_return"
						} else {
							// Outbound flights
							effectiveStep = "select_outbound"
						}
					}

					return (
						<FlightCard
							key={flight.id}
							flight={flight}
							onBook={onBookFlight}
							showRating={true}
							isSelected={isSelected}
							isDisabled={isDisabled}
							isRoundTrip={isRoundTrip}
							currentStep={effectiveStep}
						/>
					)
				})}
			</div>

			{/* Pagination */}
			{total_pages > 1 && onPageChange && (
				<div className="flex justify-center">
					<Pagination
						currentPage={page}
						totalPages={total_pages}
						onPageChange={onPageChange}
						showFirstLast={true}
						maxVisiblePages={5}
					/>
				</div>
			)}

			{/* Loading More Indicator */}
			{isLoading && results && (
				<div className="space-y-4">
					{Array.from({ length: 2 }).map((_, i) => (
						<FlightCardSkeleton key={`loading-${i}`} />
					))}
				</div>
			)}
		</div>
	)
}
