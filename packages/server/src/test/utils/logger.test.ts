import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { logger } from "../../utils/logger"

describe("Logger", () => {
	let consoleSpy: {
		log: any
		error: any
		warn: any
		debug: any
	}

	beforeEach(() => {
		consoleSpy = {
			log: vi.spyOn(console, "log").mockImplementation(() => {}),
			error: vi.spyOn(console, "error").mockImplementation(() => {}),
			warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
			debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
		}
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("should log info messages", () => {
		logger.info("Test info message")
		expect(consoleSpy.log).toHaveBeenCalledWith(
			expect.stringContaining("INFO: Test info message"),
		)
	})

	it("should log error messages", () => {
		logger.error("Test error message")
		expect(consoleSpy.error).toHaveBeenCalledWith(
			expect.stringContaining("ERROR: Test error message"),
		)
	})

	it("should log warn messages", () => {
		logger.warn("Test warn message")
		expect(consoleSpy.warn).toHaveBeenCalledWith(
			expect.stringContaining("WARN: Test warn message"),
		)
	})

	it("should include metadata in log messages", () => {
		const metadata = { userId: "123", action: "test" }
		logger.info("Test with metadata", metadata)

		expect(consoleSpy.log).toHaveBeenCalledWith(
			expect.stringContaining("Test with metadata"),
		)
		expect(consoleSpy.log).toHaveBeenCalledWith(
			expect.stringContaining(JSON.stringify(metadata)),
		)
	})

	it("should format timestamps correctly", () => {
		logger.info("Test timestamp")

		expect(consoleSpy.log).toHaveBeenCalledWith(
			expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/),
		)
	})
})
