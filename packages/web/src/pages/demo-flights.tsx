import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Flight, FlightSearchResponse } from '@flight-booking/shared'
import { FlightSearchResults } from '@/components/flight-search/flight-search-results'
import { Button } from '@/components/ui/button'
import { generateMockSearchResults } from '@/lib/mock-data'

export function DemoFlightsPage() {
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadDemoData = () => {
    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const mockResults = generateMockSearchResults('NRT', 'KIX', 1, 10)
      setSearchResults(mockResults)
      setCurrentPage(1)
      setIsLoading(false)
    }, 1000)
  }

  const handleBookFlight = (flight: Flight) => {
    navigate('/book', { state: { flight } })
  }

  const handlePageChange = (page: number) => {
    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const mockResults = generateMockSearchResults('NRT', 'KIX', page, 10)
      setSearchResults(mockResults)
      setCurrentPage(page)
      setIsLoading(false)
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 500)
  }

  const handleSortChange = (sortBy: string) => {
    console.log('Sort changed to:', sortBy)
    // The FlightSearchResults component handles client-side sorting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Flight Listing Demo</h1>
        <p className="text-muted-foreground mb-6">
          This page demonstrates the flight listing functionality with mock data.
        </p>
        
        {!searchResults && (
          <Button onClick={handleLoadDemoData} disabled={isLoading} size="lg">
            {isLoading ? 'Loading...' : 'Load Demo Flight Data'}
          </Button>
        )}
      </div>

      {(searchResults || isLoading) && (
        <FlightSearchResults
          results={searchResults}
          isLoading={isLoading}
          error={null}
          onBookFlight={handleBookFlight}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  )
}
