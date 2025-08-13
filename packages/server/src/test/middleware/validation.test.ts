import type { NextFunction, Request, Response } from "express"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { validateRequest } from "../../middleware/validation"

describe("Validation Middleware", () => {
	const mockRequest = (body?: any, query?: any, params?: any) =>
		({
			body: body || {},
			query: query || {},
			params: params || {},
		}) as Request

	const mockResponse = () => ({}) as Response

	const mockNext = vi.fn() as NextFunction

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should validate request body successfully", () => {
		const schema = {
			body: z.object({
				name: z.string(),
				age: z.number(),
			}),
		}

		const req = mockRequest({ name: "John", age: 30 })
		const res = mockResponse()

		const middleware = validateRequest(schema)
		middleware(req, res, mockNext)

		expect(mockNext).toHaveBeenCalledWith()
		expect(req.body).toEqual({ name: "John", age: 30 })
	})

	it("should validate request query successfully", () => {
		const schema = {
			query: z.object({
				page: z.string().transform(Number),
				limit: z.string().transform(Number),
			}),
		}

		const req = mockRequest(undefined, { page: "1", limit: "10" })
		const res = mockResponse()

		const middleware = validateRequest(schema)
		middleware(req, res, mockNext)

		expect(mockNext).toHaveBeenCalledWith()
		expect(req.query).toEqual({ page: 1, limit: 10 })
	})

	it("should pass validation errors to next middleware", () => {
		const schema = {
			body: z.object({
				name: z.string(),
				age: z.number(),
			}),
		}

		const req = mockRequest({ name: "John", age: "invalid" })
		const res = mockResponse()

		const middleware = validateRequest(schema)
		middleware(req, res, mockNext)

		expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
	})

	it("should handle missing required fields", () => {
		const schema = {
			body: z.object({
				name: z.string(),
				email: z.string().email(),
			}),
		}

		const req = mockRequest({ name: "John" }) // missing email
		const res = mockResponse()

		const middleware = validateRequest(schema)
		middleware(req, res, mockNext)

		expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
	})
})
