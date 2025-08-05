import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Flight, FlightSearchResponse } from '@flight-booking/shared'
import { FlightSearchForm } from '@/components/flight-search/flight-search-form'
import { FlightSearchResults } from '@/components/flight-search/flight-search-results'
import { useAsyncOperation } from '@/hooks/use-api'
import { api } from '@/lib/api'
import { type FlightSearchFormData } from '@/lib/validations'
import { Search, Calendar, MapPin } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { execute: searchFlights, isLoading, error } = useAsyncOperation<FlightSearchResponse, any>()

  const handleSearch = async (formData: FlightSearchFormData) => {
    try {
      // Convert form data to API parameters
      const searchParams = {
        source: formData.source,
        destination: formData.destination,
        departure_date: formData.departureDate.toISOString().split('T')[0],
        return_date: formData.returnDate?.toISOString().split('T')[0],
        is_round_trip: formData.isRoundTrip,
        page: 1,
        limit: 10,
        sort_by: 'price' as const,
        sort_order: 'asc' as const,
      }

      const results = await searchFlights(api.flights.search, searchParams)
      setSearchResults(results)
      setCurrentPage(1)
    } catch (error) {
      console.error('Flight search failed:', error)
    }
  }

  const handleBookFlight = (flight: Flight) => {
    // Navigate to booking page with flight data
    navigate('/book', { state: { flight } })
  }

  const handleLoadMore = async () => {
    if (!searchResults) return

    try {
      const nextPage = currentPage + 1
      // This would typically use the same search parameters with updated page
      // For now, we'll just show a placeholder
      console.log('Load more flights for page:', nextPage)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('Failed to load more flights:', error)
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
        <FlightSearchResults
          results={searchResults}
          isLoading={isLoading}
          error={error}
          onBookFlight={handleBookFlight}
          onLoadMore={handleLoadMore}
          hasMore={searchResults ? currentPage < searchResults.total_pages : false}
        />
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
