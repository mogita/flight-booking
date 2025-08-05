import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Plane, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error'
import { ProtectedRoute, useAuth } from '@/hooks/use-auth'
import { useApi } from '@/hooks/use-api'
import { api } from '@/lib/api'
import type { Booking } from '@flight-booking/shared'

export function BookingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])

  // Fetch user's bookings
  const { 
    data: fetchedBookings, 
    isLoading, 
    error,
    refetch 
  } = useApi(
    () => api.bookings.getAll(),
    []
  )

  useEffect(() => {
    if (fetchedBookings) {
      setBookings(fetchedBookings)
    }
  }, [fetchedBookings])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    // The database stores timestamps in Asia/Shanghai timezone but marks them as UTC
    // We need to adjust for this by subtracting 8 hours to get the actual UTC time
    const date = new Date(dateString)
    const adjustedDate = new Date(date.getTime() - (8 * 60 * 60 * 1000)) // Subtract 8 hours

    return adjustedDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading your bookings..." />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title="Failed to Load Bookings"
          message={error}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flight reservations and travel plans.
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't made any flight bookings yet. Start planning your next trip!
              </p>
              <Button onClick={() => navigate('/')}>
                Search Flights
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Booking #{booking.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Booked on {formatDateTime(booking.created_at)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status || 'confirmed')}`}>
                      {(booking.status || 'confirmed').toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Flight Details */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">
                        {booking.flight?.airline} {booking.flight?.flight_number}
                      </h4>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(Number(booking.flight?.price || 0))}
                        </p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Route */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {booking.flight?.source} → {booking.flight?.destination}
                          </p>
                          <p className="text-sm text-muted-foreground">Route</p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {booking.flight?.departure_date && formatDate(booking.flight.departure_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">Departure Date</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {booking.flight?.departure_time && formatTime(booking.flight.departure_time)} - {booking.flight?.arrival_time && formatTime(booking.flight.arrival_time)}
                          </p>
                          <p className="text-sm text-muted-foreground">Flight Time</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.fullname}</p>
                      <p className="text-sm text-muted-foreground">{booking.email}</p>
                    </div>
                  </div>


                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
