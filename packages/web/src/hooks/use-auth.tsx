import type { AuthUser, LoginRequest } from "@flight-booking/shared"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ApiError, api, setAuthRedirectHandler } from "@/lib/api"

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

// Component to set up auth redirect handler (must be inside Router)
function AuthRedirectHandler() {
	const navigate = useNavigate()

	useEffect(() => {
		setAuthRedirectHandler((returnPath) => {
			navigate("/login", {
				state: { returnTo: returnPath || "/" },
				replace: true,
			})
		})
	}, [navigate])

	return null // This component doesn't render anything
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
				const payload = JSON.parse(atob(token.split(".")[1]))
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
				setError("Login failed. Please try again.")
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
			<AuthRedirectHandler />
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}

// Protected route component
interface ProtectedRouteProps {
	children: React.ReactNode
	fallback?: React.ReactNode
	redirectToLogin?: boolean // New prop to control redirect behavior
}

export function ProtectedRoute({
	children,
	fallback,
	redirectToLogin = true,
}: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()

	// Automatically redirect to login when not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated && redirectToLogin) {
			navigate("/login", {
				state: {
					returnTo: location.pathname + location.search,
					// Preserve any flight data from the original navigation
					...(location.state && { originalState: location.state }),
				},
				replace: true,
			})
		}
	}, [isAuthenticated, isLoading, navigate, location, redirectToLogin])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		// If redirectToLogin is false, show fallback UI
		if (!redirectToLogin) {
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

		// If redirectToLogin is true, show loading while redirect happens
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="text-muted-foreground">Redirecting to login...</div>
			</div>
		)
	}

	return <>{children}</>
}
