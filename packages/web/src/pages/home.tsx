import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Flight, FlightSearchResponse } from '@flight-booking/shared'
import { FlightSearchForm } from '@/components/flight-search/flight-search-form'
import { FlightSearchResults } from '@/components/flight-search/flight-search-results'
import { useAsyncOperation } from '@/hooks/use-api'
import { api } from '@/lib/api'
import { type FlightSearchFormData } from '@/lib/validations'
import { generateMockSearchResults } from '@/lib/mock-data'
import { Search, Calendar, MapPin } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null)
  const [returnSearchResults, setReturnSearchResults] = useState<FlightSearchResponse | null>(null)
  const [isRoundTripSearch, setIsRoundTripSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { execute: searchFlights, isLoading, error } = useAsyncOperation<FlightSearchResponse, any>()

  const handleSearch = async (formData: FlightSearchFormData) => {
    try {
      setIsRoundTripSearch(formData.isRoundTrip)

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
        } else {
          setReturnSearchResults(null)
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
        setReturnSearchResults(null)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Flight search failed:', error)
    }
  }

  const handleBookFlight = (flight: Flight) => {
    // Navigate to booking page with flight data
    navigate('/book', { state: { flight } })
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
              {isRoundTripSearch ? 'Outbound Flights' : 'Flight Results'}
            </h2>
            <FlightSearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              onBookFlight={handleBookFlight}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Return Flights (Round Trip Only) */}
          {isRoundTripSearch && returnSearchResults && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Return Flights</h2>
              <FlightSearchResults
                results={returnSearchResults}
                isLoading={false}
                error={null}
                onBookFlight={handleBookFlight}
                onPageChange={() => {}} // Disable pagination for return flights for now
                onSortChange={() => {}} // Disable sorting for return flights for now
              />
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
          <p className="text-muted-foreground">
            Find flights quickly with our intuitive search interface. Filter by price, time, and airline.
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Flexible Dates</h3>
          <p className="text-muted-foreground">
            Choose from available dates and find the best prices for your travel schedule.
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Multiple Destinations</h3>
          <p className="text-muted-foreground">
            Book flights to various destinations across Japan and beyond with trusted airlines.
          </p>
        </div>
      </div>
    </div>
  )
}
