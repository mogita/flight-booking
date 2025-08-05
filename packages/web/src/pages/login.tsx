import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormError, InlineError } from '@/components/ui/error'
import { LoadingSpinner } from '@/components/ui/loading'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Security: Rate limiting state (client-side for demo)
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

interface LoginAttempt {
  count: number
  lastAttempt: number
  lockedUntil?: number
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt>({ count: 0, lastAttempt: 0 })
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0)

  const returnTo = location.state?.returnTo || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // Security: Check for account lockout
  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts')
    if (stored) {
      try {
        const attempts: LoginAttempt = JSON.parse(stored)
        const now = Date.now()
        
        if (attempts.lockedUntil && attempts.lockedUntil > now) {
          setIsLocked(true)
          setLockoutTimeRemaining(Math.ceil((attempts.lockedUntil - now) / 1000))
          setLoginAttempts(attempts)
        } else if (attempts.lockedUntil && attempts.lockedUntil <= now) {
          // Lockout expired, reset attempts
          const resetAttempts = { count: 0, lastAttempt: 0 }
          setLoginAttempts(resetAttempts)
          localStorage.setItem('loginAttempts', JSON.stringify(resetAttempts))
        } else {
          setLoginAttempts(attempts)
        }
      } catch (error) {
        console.error('Error parsing login attempts:', error)
      }
    }
  }, [])

  // Security: Countdown timer for lockout
  useEffect(() => {
    if (isLocked && lockoutTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false)
            const resetAttempts = { count: 0, lastAttempt: 0 }
            setLoginAttempts(resetAttempts)
            localStorage.setItem('loginAttempts', JSON.stringify(resetAttempts))
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isLocked, lockoutTimeRemaining])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, navigate, returnTo])

  // Security: Input sanitization
  const sanitizeInput = (value: string): string => {
    return value.replace(/[<>\"'&]/g, '').trim().substring(0, 100)
  }

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const sanitized = sanitizeInput(e.target.value)
    setValue(field, sanitized)
    clearError()
  }

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) return

    try {
      if (!data.username || !data.password) {
        return
      }

      if (data.username.length < 3 || data.password.length < 3) {
        return
      }

      await login(data)
      
      // Reset attempts on successful login
      const resetAttempts = { count: 0, lastAttempt: 0 }
      setLoginAttempts(resetAttempts)
      localStorage.setItem('loginAttempts', JSON.stringify(resetAttempts))
      
    } catch (error) {
      // Security: Track failed attempts
      // For the demo purpose only. For production, use server-side tracking
      const now = Date.now()
      const newAttempts: LoginAttempt = {
        count: loginAttempts.count + 1,
        lastAttempt: now,
      }

      if (newAttempts.count >= MAX_ATTEMPTS) {
        newAttempts.lockedUntil = now + LOCKOUT_DURATION
        setIsLocked(true)
        setLockoutTimeRemaining(LOCKOUT_DURATION / 1000)
      }

      setLoginAttempts(newAttempts)
      localStorage.setItem('loginAttempts', JSON.stringify(newAttempts))
    }
  }

  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const remainingAttempts = MAX_ATTEMPTS - loginAttempts.count

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </CardHeader>
          <CardContent>
            {/* Security Warning for Lockout */}
            {isLocked && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Account Temporarily Locked</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Too many failed login attempts. Please try again in {formatLockoutTime(lockoutTimeRemaining)}.
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Demo Credentials</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Username: <code className="bg-blue-100 px-1 rounded">user</code> |
                Password: <code className="bg-blue-100 px-1 rounded">user</code>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  {...register('username')}
                  onChange={handleInputChange('username')}
                  placeholder="Enter your username"
                  className={errors.username ? 'border-destructive' : ''}
                  disabled={isLocked}
                  autoComplete="username"
                />
                {errors.username && (
                  <InlineError message={errors.username.message || 'Invalid username'} />
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    onChange={handleInputChange('password')}
                    placeholder="Enter your password"
                    className={cn(
                      'pr-10',
                      errors.password ? 'border-destructive' : ''
                    )}
                    disabled={isLocked}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <InlineError message={errors.password.message || 'Invalid password'} />
                )}
              </div>

              {/* Form Errors */}
              {Object.keys(errors).length > 0 && (
                <FormError 
                  errors={Object.values(errors).map(error => error?.message || 'Invalid input')} 
                />
              )}

              {/* API Error */}
              {error && !isLocked && (
                <div className="space-y-2">
                  <InlineError message={error} />
                  {remainingAttempts > 0 && remainingAttempts < MAX_ATTEMPTS && (
                    <p className="text-sm text-yellow-600">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isLocked}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
