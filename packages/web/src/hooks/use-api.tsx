import { useEffect, useState } from "react"
import { ApiError } from "@/lib/api"

// Generic API hook for data fetching
export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
	const [data, setData] = useState<T | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchData = async () => {
		try {
			setIsLoading(true)
			setError(null)
			const result = await apiCall()
			setData(result)
		} catch (error) {
			if (error instanceof ApiError) {
				setError(error.message)
			} else {
				setError("An unexpected error occurred")
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchData()
	}, dependencies)

	const refetch = () => {
		fetchData()
	}

	return { data, isLoading, error, refetch }
}

// Hook for async operations (mutations)
export function useAsyncOperation<T = any, P = any>() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [data, setData] = useState<T | null>(null)

	const execute = async (operation: (params: P) => Promise<T>, params: P) => {
		try {
			setIsLoading(true)
			setError(null)
			const result = await operation(params)
			setData(result)
			return result
		} catch (error) {
			if (error instanceof ApiError) {
				setError(error.message)
			} else {
				setError("An unexpected error occurred")
			}
			throw error
		} finally {
			setIsLoading(false)
		}
	}

	const clearError = () => setError(null)
	const reset = () => {
		setData(null)
		setError(null)
		setIsLoading(false)
	}

	return { execute, isLoading, error, data, clearError, reset }
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error)
			return initialValue
		}
	})

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value
			setStoredValue(valueToStore)
			window.localStorage.setItem(key, JSON.stringify(valueToStore))
		} catch (error) {
			console.error(`Error setting localStorage key "${key}":`, error)
		}
	}

	const removeValue = () => {
		try {
			window.localStorage.removeItem(key)
			setStoredValue(initialValue)
		} catch (error) {
			console.error(`Error removing localStorage key "${key}":`, error)
		}
	}

	return [storedValue, setValue, removeValue] as const
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}
