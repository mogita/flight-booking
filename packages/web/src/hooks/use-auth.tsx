import React, { createContext, useContext, useEffect, useState } from 'react'
import type { LoginRequest, AuthUser } from '@flight-booking/shared'
import { api, ApiError } from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing token on mount
  useEffect(() => {
    const token = api.auth.getToken()
    if (token) {
      // In a real app, you'd validate the token with the server
      // For now, we'll assume it's valid and extract user info
      try {
        // Simple token parsing (in production, use proper JWT parsing)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          username: payload.username,
          token,
        })
      } catch (error) {
        // Invalid token, remove it
        api.auth.logout()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.auth.login(credentials)
      
      const authUser: AuthUser = {
        username: response.user.username,
        token: response.token,
      }
      
      setUser(authUser)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Login failed. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    api.auth.logout()
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to access this page.
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
