import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, MapPin, Calendar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormError } from '@/components/ui/error'
import { flightSearchSchema, type FlightSearchFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface FlightSearchFormProps {
  onSearch: (data: FlightSearchFormData) => void
  isLoading?: boolean
  className?: string
}

// Popular destinations for quick selection
const POPULAR_DESTINATIONS = [
  { code: 'NRT', name: 'Tokyo (NRT)', city: 'Tokyo' },
  { code: 'KIX', name: 'Osaka (KIX)', city: 'Osaka' },
  { code: 'FUK', name: 'Fukuoka (FUK)', city: 'Fukuoka' },
  { code: 'CTS', name: 'Sapporo (CTS)', city: 'Sapporo' },
  { code: 'OKA', name: 'Okinawa (OKA)', city: 'Okinawa' },
]

export function FlightSearchForm({ onSearch, isLoading = false, className }: FlightSearchFormProps) {
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      source: '',
      destination: '',
      isRoundTrip: false,
      departureDate: new Date('2025-01-15'), // Set to date with available flights for demo
    },
  })

  const watchedDepartureDate = watch('departureDate')

  const onSubmit = (data: FlightSearchFormData) => {
    onSearch(data)
  }

  const onError = (errors: any) => {
    console.log('❌ Form validation failed:', errors)
  }

  const handleRoundTripToggle = () => {
    const newValue = !isRoundTrip
    setIsRoundTrip(newValue)
    setValue('isRoundTrip', newValue)
    if (!newValue) {
      setValue('returnDate', undefined)
    }
  }

  const handleSwapCities = () => {
    const source = watch('source')
    const destination = watch('destination')
    setValue('source', destination)
    setValue('destination', source)
  }

  const handleQuickSelect = (location: string, field: 'source' | 'destination') => {
    setValue(field, location)
  }

  const handleReset = () => {
    reset()
    setIsRoundTrip(false)
  }

  const today = new Date()
  const maxDate = new Date()
  maxDate.setFullYear(today.getFullYear() + 1) // Allow booking up to 1 year ahead

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-6 w-6" />
          Search Flights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Trip Type Toggle */}
          <div className="flex items-center space-x-4">
            <Label className="text-base font-medium">Trip Type:</Label>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="one-way"
                checked={!isRoundTrip}
                onChange={() => handleRoundTripToggle()}
                className="h-4 w-4"
              />
              <Label htmlFor="one-way" className="cursor-pointer">One Way</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="round-trip"
                checked={isRoundTrip}
                onChange={() => handleRoundTripToggle()}
                className="h-4 w-4"
              />
              <Label htmlFor="round-trip" className="cursor-pointer">Round Trip</Label>
            </div>
          </div>

          {/* Location and Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* From Field */}
            <div className="space-y-2">
              <Label htmlFor="source" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                From
              </Label>
              <Input
                id="source"
                placeholder="Departure city"
                {...register('source')}
                className={errors.source ? 'border-destructive' : ''}
              />
              {errors.source && (
                <p className="text-sm text-destructive">{errors.source.message}</p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwapCities}
                className="mb-2"
                title="Swap cities"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* To Field */}
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                To
              </Label>
              <Input
                id="destination"
                placeholder="Destination city"
                {...register('destination')}
                className={errors.destination ? 'border-destructive' : ''}
              />
              {errors.destination && (
                <p className="text-sm text-destructive">{errors.destination.message}</p>
              )}
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Departure
                <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={watchedDepartureDate}
                onChange={(date) => setValue('departureDate', date)}
                minDate={today}
                maxDate={maxDate}
                placeholder="Select departure date"
                className={errors.departureDate ? 'border-destructive' : ''}
              />
              {errors.departureDate && (
                <p className="text-sm text-destructive">{errors.departureDate.message}</p>
              )}
            </div>
          </div>

          {/* Return Date (Round Trip Only) */}
          {isRoundTrip && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-start-4 space-y-2">
                <Label htmlFor="returnDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Return
                </Label>
                <DatePicker
                  value={watch('returnDate')}
                  onChange={(date) => setValue('returnDate', date)}
                  minDate={watchedDepartureDate || today}
                  maxDate={maxDate}
                  placeholder="Select return date"
                  className={errors.returnDate ? 'border-destructive' : ''}
                />
                {errors.returnDate && (
                  <p className="text-sm text-destructive">{errors.returnDate.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Quick Select Destinations */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Popular Destinations:</Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((dest) => (
                <div key={dest.code} className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(dest.name, 'source')}
                    className="text-xs"
                  >
                    From {dest.city}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(dest.name, 'destination')}
                    className="text-xs"
                  >
                    To {dest.city}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Errors */}
          {Object.keys(errors).length > 0 && (
            <FormError 
              errors={Object.values(errors).map(error => error?.message || 'Invalid input')} 
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Flights
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
