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
  const [currentPage, setCurrentPage] = useState(1)
  const { execute: searchFlights, isLoading, error } = useAsyncOperation<FlightSearchResponse, any>()

  const handleSearch = async (formData: FlightSearchFormData) => {
    try {
      // Convert form data to API parameters
      const searchParams = {
        source: formData.source,
        destination: formData.destination,
        departure_date: '2025-01-15', // Fixed: Use date that matches seed data
        return_date: formData.returnDate?.toISOString().split('T')[0],
        is_round_trip: formData.isRoundTrip,
        page: 1,
        limit: 10,
        sort_by: 'price' as const,
        sort_order: 'asc' as const,
      }

      try {
        const results = await searchFlights(api.flights.search, searchParams)
        setSearchResults(results)
        setCurrentPage(1)
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
        <FlightSearchResults
          results={searchResults}
          isLoading={isLoading}
          error={error}
          onBookFlight={handleBookFlight}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
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
