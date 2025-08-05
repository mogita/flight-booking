import React, { useState } from 'react'
import { format } from 'date-fns'
import { Plane, Clock, ArrowRight, Filter, SortAsc, SortDesc } from 'lucide-react'
import type { Flight, FlightSearchResponse } from '@flight-booking/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { LoadingState, FlightCardSkeleton } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error'
import { cn } from '@/lib/utils'

interface FlightSearchResultsProps {
  results: FlightSearchResponse | null
  isLoading: boolean
  error: string | null
  onBookFlight: (flight: Flight) => void
  onLoadMore?: () => void
  hasMore?: boolean
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
  onLoadMore,
  hasMore = false,
  className,
}: FlightSearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('price_asc')

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
        return parseFloat(a.price) - parseFloat(b.price)
      case 'price_desc':
        return parseFloat(b.price) - parseFloat(a.price)
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

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd')
  }

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(parseFloat(price))
  }

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
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {sortedFlights.map((flight) => (
          <Card key={flight.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Flight Info */}
                <div className="flex-1 space-y-4">
                  {/* Airline and Flight Number */}
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{flight.airline}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{flight.flight_number}</span>
                  </div>

                  {/* Route and Times */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatTime(flight.departure_time)}</div>
                      <div className="text-sm text-muted-foreground">{flight.source}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(flight.departure_date)}</div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-px bg-border flex-1" />
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                          {calculateDuration(flight.departure_time, flight.arrival_time)}
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div className="h-px bg-border flex-1" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatTime(flight.arrival_time)}</div>
                      <div className="text-sm text-muted-foreground">{flight.destination}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(flight.arrival_date)}</div>
                    </div>
                  </div>
                </div>

                {/* Price and Book Button */}
                <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(flight.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                  <Button
                    onClick={() => onBookFlight(flight)}
                    size="lg"
                    className="whitespace-nowrap"
                  >
                    Book Flight
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More Flights'}
          </Button>
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
