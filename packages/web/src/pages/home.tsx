import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Flight, FlightSearchResponse } from '@flight-booking/shared'
import { FlightSearchForm } from '@/components/flight-search/flight-search-form'
import { FlightSearchResults } from '@/components/flight-search/flight-search-results'
import { useAsyncOperation } from '@/hooks/use-api'
import { useRoundTripBooking } from '@/hooks/use-round-trip-booking'
import { api } from '@/lib/api'
import { type FlightSearchFormData } from '@/lib/validations'
import { generateMockSearchResults } from '@/lib/mock-data'


export function HomePage() {
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null)
  const [returnSearchResults, setReturnSearchResults] = useState<FlightSearchResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { execute: searchFlights, isLoading, error } = useAsyncOperation<FlightSearchResponse, any>()

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

      // Search for outbound flights
      const outboundParams = {
        source: formData.source,
        destination: formData.destination,
        departure_date: formData.departureDate.toISOString().split('T')[0],
        page: 1,
        limit: 10,
        sort_by: 'price' as const,
        sort_order: 'asc' as const,
      }

      try {
        const outboundResults = await searchFlights(api.flights.search, outboundParams)
        setSearchResults(outboundResults)
        setOutboundFlights(outboundResults?.flights || [])
        setCurrentPage(1)

        // If round trip, also search for return flights
        if (formData.isRoundTrip && formData.returnDate) {
          const returnParams = {
            source: formData.destination, // Swap source and destination
            destination: formData.source,
            departure_date: formData.returnDate.toISOString().split('T')[0],
            page: 1,
            limit: 10,
            sort_by: 'price' as const,
            sort_order: 'asc' as const,
          }

          const returnResults = await searchFlights(api.flights.search, returnParams)
          setReturnSearchResults(returnResults)
          setReturnFlights(returnResults?.flights || [])
        } else {
          setReturnSearchResults(null)
          setReturnFlights([])
        }
      } catch (apiError) {
        // Fallback to mock data for demonstration
        console.log('API not available, using mock data for demonstration')
        const mockResults = generateMockSearchResults(
          formData.source.split('(')[1]?.replace(')', '') || 'NRT',
          formData.destination.split('(')[1]?.replace(')', '') || 'KIX',
          1,
          10
        )
        setSearchResults(mockResults)
        setOutboundFlights(mockResults?.flights || [])
        setReturnSearchResults(null)
        setReturnFlights([])
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Flight search failed:', error)
    }
  }

  const handleBookFlight = (flight: Flight) => {
    if (isRoundTrip) {
      if (currentStep === 'select_outbound') {
        // Select outbound flight
        selectOutboundFlight(flight)
      } else if (currentStep === 'select_return') {
        // Select return flight and proceed to booking
        selectReturnFlight(flight)
        navigate('/book', {
          state: {
            outboundFlight: selectedOutboundFlight,
            returnFlight: flight,
            isRoundTrip: true
          }
        })
      }
    } else {
      // One-way booking
      navigate('/book', { state: { flight } })
    }
  }

  const handlePageChange = async (page: number) => {
    if (!searchResults) return

    try {
      // In a real implementation, you would re-search with the new page
      // For now, we'll just update the current page
      console.log('Navigate to page:', page)
      setCurrentPage(page)

      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Failed to change page:', error)
    }
  }

  const handleSortChange = async (sortBy: string) => {
    if (!searchResults) return

    try {
      // In a real implementation, you would re-search with the new sort order
      console.log('Sort by:', sortBy)

      // For demo purposes, we'll just log the sort change
      // The FlightSearchResults component handles client-side sorting
    } catch (error) {
      console.error('Failed to change sort:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Form */}
      <div className="mb-8">
        <FlightSearchForm
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Search Results */}
      {(searchResults || isLoading || error) && (
        <div className="space-y-8">
          {/* Outbound Flights */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {isRoundTrip ? 'Outbound Flights' : ''}
            </h2>
            <FlightSearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              onBookFlight={handleBookFlight}
              onPageChange={handlePageChange}
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
                onPageChange={() => {}} // Disable pagination for return flights for now
                onSortChange={() => {}} // Disable sorting for return flights for now
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
