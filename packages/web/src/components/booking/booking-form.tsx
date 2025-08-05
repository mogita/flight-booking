import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Shield, User, Mail, Phone } from 'lucide-react'
import type { Flight } from '@flight-booking/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormError, InlineError } from '@/components/ui/error'
import { LoadingSpinner } from '@/components/ui/loading'
import { bookingSchema, type BookingFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/use-auth'
import { useAsyncOperation } from '@/hooks/use-api'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  flight: Flight
  className?: string
}

// Security: Input sanitization patterns
const SECURITY_PATTERNS = {
  name: /^[a-zA-Z\s\-'\.]{2,100}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
  cardNumber: /^[0-9\s]{13,19}$/,
  cvv: /^[0-9]{3,4}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
}

export function BookingForm({ flight, className }: BookingFormProps) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'confirmation'>('details')
  const { execute: createBooking, isLoading, error } = useAsyncOperation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<BookingFormData & {
    // Payment fields (not sent to server for security)
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
  }>({
    resolver: zodResolver(bookingSchema),
    mode: 'onSubmit', // Only validate on submit, not on change
    defaultValues: {
      flightId: flight.id,
      fullname: user?.username || '',
      email: '',
      phone: '',
    },
  })

  // Security: Input sanitization
  const sanitizeInput = (value: string, pattern: RegExp): string => {
    return value.replace(/[<>\"'&]/g, '').trim().substring(0, 200)
  }

  const handleInputChange = (field: string, pattern: RegExp) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const sanitized = sanitizeInput(e.target.value, pattern)
    setValue(field as any, sanitized)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const onSubmitDetails = async (data: any) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/book?flight=${flight.id}` } })
      return
    }

    // Security: Validate only passenger details fields for this step
    const isValid = await trigger(['fullname', 'email', 'phone'])
    if (!isValid) return

    setPaymentStep('payment')
  }

  const onSubmitPayment = async (data: any) => {
    setIsProcessing(true)
    
    try {
      // Security: Only send necessary booking data to server
      // Payment details are handled client-side for demo
      const bookingData = {
        flightId: flight.id,
        fullname: sanitizeInput(data.fullname, SECURITY_PATTERNS.name),
        email: sanitizeInput(data.email, SECURITY_PATTERNS.email),
        phone: data.phone ? sanitizeInput(data.phone, SECURITY_PATTERNS.phone) : undefined,
      }

      // Simulate payment processing (in real app, use secure payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create booking after successful payment simulation
      const booking = await createBooking(api.bookings.create, bookingData)
      
      setPaymentStep('confirmation')
      
      // Redirect to bookings page after confirmation
      setTimeout(() => {
        navigate('/bookings')
      }, 3000)
      
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStep === 'confirmation') {
    return (
      <Card className={cn('max-w-2xl mx-auto', className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your flight has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">{flight.airline} {flight.flight_number}</p>
            <p className="text-sm text-muted-foreground">
              {flight.source} → {flight.destination}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Redirecting to your bookings...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Flight Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Flight Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{flight.airline} {flight.flight_number}</h3>
              <p className="text-muted-foreground">
                {flight.source} → {flight.destination}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(flight.departure_time).toLocaleDateString()} at{' '}
                {new Date(flight.departure_time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(flight.price)}</p>
              <p className="text-sm text-muted-foreground">per person</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paymentStep === 'details' ? (
              <>
                <User className="h-5 w-5" />
                Passenger Details
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Payment Information
              </>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Your information is encrypted and secure
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(paymentStep === 'details' ? onSubmitDetails : onSubmitPayment)}>
            {paymentStep === 'details' && (
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="fullname"
                    {...register('fullname')}
                    onChange={handleInputChange('fullname', SECURITY_PATTERNS.name)}
                    placeholder="Enter your full name as it appears on your ID"
                    className={errors.fullname ? 'border-destructive' : ''}
                  />
                  {errors.fullname && (
                    <InlineError message={errors.fullname.message || 'Invalid name'} />
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    onChange={handleInputChange('email', SECURITY_PATTERNS.email)}
                    placeholder="Enter your email address"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <InlineError message={errors.email.message || 'Invalid email'} />
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    onChange={handleInputChange('phone', SECURITY_PATTERNS.phone)}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <InlineError message={errors.phone.message || 'Invalid phone number'} />
                  )}
                </div>
              </div>
            )}

            {paymentStep === 'payment' && (
              <div className="space-y-4">
                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Secure Payment</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a demo. No real payment will be processed.
                  </p>
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    {...register('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value)
                      setValue('cardNumber', formatted)
                    }}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      {...register('expiryDate')}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>

                  {/* CVV */}
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      {...register('cvv')}
                      placeholder="123"
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    {...register('cardholderName')}
                    placeholder="Name as it appears on card"
                  />
                </div>
              </div>
            )}

            {/* Form Errors - exclude field-specific errors that are already shown next to fields */}
            {Object.keys(errors).filter(key => !['fullname', 'email', 'phone', 'cardNumber', 'expiryDate', 'cvv', 'cardholderName'].includes(key)).length > 0 && (
              <FormError
                errors={Object.entries(errors)
                  .filter(([key]) => !['fullname', 'email', 'phone', 'cardNumber', 'expiryDate', 'cvv', 'cardholderName'].includes(key))
                  .map(([, error]) => error?.message || 'Invalid input')
                }
              />
            )}

            {/* API Error */}
            {error && (
              <InlineError message={error} />
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              {paymentStep === 'payment' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentStep('details')}
                  disabled={isProcessing}
                >
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || isProcessing}
                className="ml-auto px-8"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : paymentStep === 'details' ? (
                  'Continue to Payment'
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Complete Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
