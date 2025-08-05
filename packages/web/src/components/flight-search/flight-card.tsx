import { format } from 'date-fns'
import { Plane, Clock, ArrowRight, Star, Check, X } from 'lucide-react'
import type { Flight } from '@flight-booking/shared'
import type { RoundTripBookingStep } from '@/hooks/use-round-trip-booking'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FlightCardProps {
  flight: Flight
  onBook: (flight: Flight) => void
  className?: string
  showRating?: boolean
  // Round trip booking props
  isSelected?: boolean
  isDisabled?: boolean
  isRoundTrip?: boolean
  currentStep?: RoundTripBookingStep
}

export function FlightCard({
  flight,
  onBook,
  className,
  showRating = false,
  isSelected = false,
  isDisabled = false,
  isRoundTrip = false,
  currentStep = 'select_outbound'
}: FlightCardProps) {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Generate a rating based on flight number (in real app, this would come from API)
  const generateRating = (flightNumber: string) => {
    const hash = flightNumber.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return 3.5 + (Math.abs(hash) % 15) / 10 // Rating between 3.5 and 5.0
  }

  const rating = generateRating(flight.flight_number)

  const getButtonText = () => {
    if (isSelected) return 'Selected'
    if (isRoundTrip) {
      if (currentStep === 'select_outbound') return 'Select Outbound'
      if (currentStep === 'select_return') return 'Select Return'
    }
    return 'Book Flight'
  }

  const getCardClassName = () => {
    let baseClass = 'hover:shadow-lg transition-all duration-200 border-l-4'

    if (isSelected) {
      baseClass += ' border-l-green-500 bg-green-50 dark:bg-green-950/20'
    } else if (isDisabled) {
      baseClass += ' border-l-gray-300 opacity-50 cursor-not-allowed'
    } else {
      baseClass += ' border-l-primary/20'
    }

    return cn(baseClass, className)
  }

  return (
    <Card className={getCardClassName()}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Flight Info */}
          <div className="flex-1 space-y-4">
            {/* Airline and Flight Number */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">{flight.airline}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>•</span>
                  <span className="text-sm font-medium">{flight.flight_number}</span>
                </div>
              </div>
              
              {/* Rating */}
              {showRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Route and Times */}
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-bold text-foreground">{formatTime(flight.departure_time)}</div>
                <div className="text-sm font-medium text-muted-foreground">{flight.source}</div>
                <div className="text-xs text-muted-foreground">{formatDate(flight.departure_date)}</div>
              </div>
              
              {/* Flight Path */}
              <div className="flex-1 flex items-center justify-center min-w-[120px]">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-px bg-border flex-1" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                      {calculateDuration(flight.departure_time, flight.arrival_time)}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-px bg-border flex-1" />
                </div>
              </div>
              
              {/* Arrival */}
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-bold text-foreground">{formatTime(flight.arrival_time)}</div>
                <div className="text-sm font-medium text-muted-foreground">{flight.destination}</div>
                <div className="text-xs text-muted-foreground">{formatDate(flight.arrival_date)}</div>
              </div>
            </div>

            {/* Additional Flight Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Direct flight</span>
              </div>
              {flight.is_round_trip && (
                <div className="flex items-center gap-1">
                  <ArrowRight className="h-4 w-4" />
                  <span>Round trip</span>
                </div>
              )}
            </div>
          </div>

          {/* Price and Book Section */}
          <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-3 lg:min-w-[160px]">
            {/* Price */}
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(flight.price)}
              </div>
              <div className="text-sm text-muted-foreground">per person</div>
              <div className="text-xs text-muted-foreground mt-1">includes taxes</div>
            </div>
            
            {/* Book Button */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => onBook(flight)}
                size="lg"
                disabled={isDisabled}
                variant={isSelected ? "default" : "default"}
                className={cn(
                  "whitespace-nowrap px-8 shadow-md hover:shadow-lg transition-shadow",
                  isSelected && "bg-green-600 hover:bg-green-700",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSelected && <Check className="h-4 w-4 mr-2" />}
                {isDisabled && <X className="h-4 w-4 mr-2" />}
                {getButtonText()}
              </Button>

              {/* Cancel Selection Button for Round Trip */}
              {isSelected && isRoundTrip && currentStep === 'select_return' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    // This will be handled by the parent component
                    // For now, we'll just show the button
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Cancel Selection
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
