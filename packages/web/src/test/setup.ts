import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock environment variables
Object.defineProperty(import.meta, "env", {
	value: {
		VITE_API_URL: "http://localhost:3000",
	},
	writable: true,
})

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
})

// Mock fetch
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}))

// Preventing Zod validation errors from showing as unhandled rejections in tests
process.on("unhandledRejection", (reason) => {
	// Check if this is a Zod validation error from form validation
	if (reason && typeof reason === "object" && "issues" in reason) {
		const zodError = reason as { issues: Array<{ message: string }> }
		const isFormValidationError = zodError.issues.some((issue) =>
			[
				"Username is required",
				"Password is required",
				"Source city is required",
				"Destination city is required",
			].includes(issue.message),
		)

		if (isFormValidationError) {
			// This is an expected form validation error in tests, don't fail
			return
		}
	}

	// Re-throw other unhandled rejections
	throw reason
})
