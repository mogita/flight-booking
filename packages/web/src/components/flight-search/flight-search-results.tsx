import { useState } from 'react'
import { Plane, Filter } from 'lucide-react'
import type { Flight, FlightSearchResponse } from '@flight-booking/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { FlightCardSkeleton } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import { FlightCard } from './flight-card'
import { cn } from '@/lib/utils'

interface FlightSearchResultsProps {
  results: FlightSearchResponse | null
  isLoading: boolean
  error: string | null
  onBookFlight: (flight: Flight) => void
  onPageChange?: (page: number) => void
  onSortChange?: (sortBy: SortOption) => void
  className?: string
}

type SortOption = 'price_asc' | 'price_desc' | 'departure_asc' | 'departure_desc' | 'duration_asc'

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'departure_asc', label: 'Departure: Early to Late' },
  { value: 'departure_desc', label: 'Departure: Late to Early' },
  { value: 'duration_asc', label: 'Duration: Shortest First' },
]

export function FlightSearchResults({
  results,
  isLoading,
  error,
  onBookFlight,
  onPageChange,
  onSortChange,
  className,
}: FlightSearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('price_asc')

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
    onSortChange?.(newSortBy)
  }

  if (isLoading && !results) {
    return (
      <div className={cn('space-y-4', className)}>
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
      <ErrorState
        title="Search Failed"
        message={error}
        className={className}
      />
    )
  }

  if (!results) {
    return null
  }

  const { flights, total, page, total_pages } = results

  if (flights.length === 0) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <CardContent>
          <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Flights Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or dates to find available flights.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort flights based on selected option
  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price
      case 'price_desc':
        return b.price - a.price
      case 'departure_asc':
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      case 'departure_desc':
        return new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime()
      case 'duration_asc':
        const durationA = new Date(a.arrival_time).getTime() - new Date(a.departure_time).getTime()
        const durationB = new Date(b.arrival_time).getTime() - new Date(b.departure_time).getTime()
        return durationA - durationB
      default:
        return 0
    }
  })



  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Flight Results</h2>
          <p className="text-muted-foreground">
            {total} flights found • Page {page} of {total_pages}
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
        currentPage={page}
        totalPages={total_pages}
        totalItems={total}
        itemsPerPage={results.limit}
        className="text-center"
      />

      {/* Flight Cards */}
      <div className="space-y-6">
        {sortedFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onBook={onBookFlight}
            showRating={true}
          />
        ))}
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
