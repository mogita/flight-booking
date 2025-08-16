import type {
	Flight,
	FlightSearchParams,
	FlightSearchResponse,
} from "@flight-booking/shared"
import { DEFAULT_PAGE_SIZE } from "@flight-booking/shared"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FlightSearchForm } from "@/components/flight-search/flight-search-form"
import { FlightSearchResults } from "@/components/flight-search/flight-search-results"
import { useAsyncOperation } from "@/hooks/use-api"
import { useRoundTripBooking } from "@/hooks/use-round-trip-booking"
import { api } from "@/lib/api"
import type { FlightSearchFormData } from "@/lib/validations"

export function HomePage() {
	const navigate = useNavigate()
	const [searchResults, setSearchResults] =
		useState<FlightSearchResponse | null>(null)
	const [returnSearchResults, setReturnSearchResults] =
		useState<FlightSearchResponse | null>(null)
	const [outboundPage, setOutboundPage] = useState(1)
	const [returnPage, setReturnPage] = useState(1)
	const [currentSort, setCurrentSort] = useState<
		| "price_asc"
		| "price_desc"
		| "departure_asc"
		| "departure_desc"
		| "duration_asc"
	>("price_asc")
	const [lastSearchParams, setLastSearchParams] =
		useState<FlightSearchParams | null>(null)
	const {
		execute: searchFlights,
		isLoading,
		error,
	} = useAsyncOperation<FlightSearchResponse, FlightSearchParams>()

	const {
		isRoundTrip,
		selectedOutboundFlight,
		selectedReturnFlight,
		currentStep,
		setIsRoundTrip,
		setOutboundFlights,
		setReturnFlights,
		selectOutboundFlight,
		selectReturnFlight,
		resetBooking,
	} = useRoundTripBooking()

	const handleSearch = async (formData: FlightSearchFormData) => {
		try {
			// Update round trip context
			setIsRoundTrip(formData.isRoundTrip)
			resetBooking()

			// Extract airport codes from city names (e.g., "Tokyo (NRT)" -> "NRT")
			const sourceCode =
				formData.source.split("(")[1]?.replace(")", "") || formData.source
			const destinationCode =
				formData.destination.split("(")[1]?.replace(")", "") ||
				formData.destination

			// Search for outbound flights
			const outboundParams = {
				source: sourceCode,
				destination: destinationCode,
				departure_date: formData.departureDate.toISOString().split("T")[0],
				page: 1,
				limit: DEFAULT_PAGE_SIZE,
				sort_by: currentSort,
			}

			// Store search params for re-sorting
			setLastSearchParams(outboundParams)

			try {
				const outboundResults = await searchFlights(
					api.flights.search,
					outboundParams,
				)
				setSearchResults(outboundResults)
				setOutboundFlights(outboundResults?.flights || [])
				setOutboundPage(1)

				// If round trip, also search for return flights
				if (formData.isRoundTrip && formData.returnDate) {
					const returnParams = {
						source: destinationCode, // Swap source and destination
						destination: sourceCode,
						departure_date: formData.returnDate.toISOString().split("T")[0],
						page: 1,
						limit: DEFAULT_PAGE_SIZE,
						sort_by: currentSort,
					}

					const returnResults = await searchFlights(
						api.flights.search,
						returnParams,
					)
					setReturnSearchResults(returnResults)
					setReturnFlights(returnResults?.flights || [])
					setReturnPage(1)
				} else {
					setReturnSearchResults(null)
					setReturnFlights([])
				}
			} catch (apiError) {
				console.error("Flight search failed:", apiError)
				// Reset search results on error
				setSearchResults(null)
				setOutboundFlights([])
				setReturnSearchResults(null)
				setReturnFlights([])
				setOutboundPage(1)
				setReturnPage(1)
			}
		} catch (error) {
			console.error("Flight search failed:", error)
		}
	}

	const handleBookFlight = (flight: Flight) => {
		if (isRoundTrip) {
			if (currentStep === "select_outbound") {
				// Select outbound flight
				selectOutboundFlight(flight)
			} else if (currentStep === "select_return") {
				// Select return flight and proceed to booking
				selectReturnFlight(flight)
				navigate("/book", {
					state: {
						outboundFlight: selectedOutboundFlight,
						returnFlight: flight,
						isRoundTrip: true,
					},
				})
			}
		} else {
			// One-way booking
			navigate("/book", { state: { flight } })
		}
	}

	const handleOutboundPageChange = async (page: number) => {
		if (!lastSearchParams) return

		try {
			setOutboundPage(page)

			const newParams = {
				...lastSearchParams,
				page,
				sort_by: currentSort,
			}

			const outboundResults = await searchFlights(api.flights.search, newParams)
			setSearchResults(outboundResults)
			setOutboundFlights(outboundResults?.flights || [])

			// Scroll to top of results
			window.scrollTo({ top: 0, behavior: "smooth" })
		} catch (error) {
			console.error("Failed to change outbound page:", error)
		}
	}

	const handleReturnPageChange = async (page: number) => {
		if (!lastSearchParams) return

		try {
			setReturnPage(page)

			const returnParams = {
				source: lastSearchParams.destination,
				destination: lastSearchParams.source,
				departure_date:
					lastSearchParams.return_date || lastSearchParams.departure_date,
				page,
				limit: DEFAULT_PAGE_SIZE,
				sort_by: currentSort,
			}

			const returnResults = await searchFlights(
				api.flights.search,
				returnParams,
			)
			setReturnSearchResults(returnResults)
			setReturnFlights(returnResults?.flights || [])

			// Scroll to top of results
			window.scrollTo({ top: 0, behavior: "smooth" })
		} catch (error) {
			console.error("Failed to change return page:", error)
		}
	}

	const handleSortChange = async (
		sortBy:
			| "price_asc"
			| "price_desc"
			| "departure_asc"
			| "departure_desc"
			| "duration_asc",
	) => {
		if (!lastSearchParams) return

		try {
			// Update current sort
			setCurrentSort(sortBy)

			// Re-search with new sort order
			const newParams = {
				...lastSearchParams,
				sort_by: sortBy,
				page: 1, // Reset to first page when sorting
			}

			const outboundResults = await searchFlights(api.flights.search, newParams)
			setSearchResults(outboundResults)
			setOutboundFlights(outboundResults?.flights || [])
			setOutboundPage(1)

			// If round trip, also re-search return flights with new sort
			if (isRoundTrip && returnSearchResults) {
				const returnParams = {
					source: lastSearchParams.destination,
					destination: lastSearchParams.source,
					departure_date:
						lastSearchParams.return_date || lastSearchParams.departure_date,
					page: 1,
					limit: DEFAULT_PAGE_SIZE,
					sort_by: sortBy,
				}

				const returnResults = await searchFlights(
					api.flights.search,
					returnParams,
				)
				setReturnSearchResults(returnResults)
				setReturnFlights(returnResults?.flights || [])
			}
		} catch (error) {
			console.error("Failed to change sort:", error)
		}
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Search Form */}
			<div className="mb-8">
				<FlightSearchForm onSearch={handleSearch} isLoading={isLoading} />
			</div>

			{/* Search Results */}
			{(searchResults || isLoading || error) && (
				<div className="space-y-8">
					{/* Outbound Flights */}
					<div>
						<h2 className="text-2xl font-bold mb-4">
							{isRoundTrip ? "Outbound Flights" : ""}
						</h2>
						<FlightSearchResults
							results={searchResults}
							isLoading={isLoading}
							error={error}
							onBookFlight={handleBookFlight}
							onPageChange={handleOutboundPageChange}
							onSortChange={handleSortChange}
							selectedFlight={selectedOutboundFlight}
							isRoundTrip={isRoundTrip}
							currentStep={currentStep}
							flightType="outbound"
						/>
					</div>

					{/* Return Flights (Round Trip Only) */}
					{isRoundTrip && returnSearchResults && (
						<div>
							<h2 className="text-2xl font-bold mb-4">Return Flights</h2>
							<FlightSearchResults
								results={returnSearchResults}
								isLoading={false}
								error={null}
								onBookFlight={handleBookFlight}
								onPageChange={handleReturnPageChange}
								onSortChange={handleSortChange}
								selectedFlight={selectedReturnFlight}
								isRoundTrip={isRoundTrip}
								currentStep={currentStep}
								flightType="return"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
