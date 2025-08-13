import "@testing-library/jest-dom"

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
