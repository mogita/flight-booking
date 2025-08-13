import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { isDevelopment } from "../config/env"
import { logger } from "../utils/logger"

export interface AppError extends Error {
	statusCode?: number
	isOperational?: boolean
}

export class ApiError extends Error implements AppError {
	public statusCode: number
	public isOperational: boolean

	constructor(
		message: string,
		statusCode: number = 500,
		isOperational: boolean = true,
	) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = isOperational

		Error.captureStackTrace(this, this.constructor)
	}
}

export const errorHandler = (
	error: AppError | ZodError | Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	let statusCode = 500
	let message = "Internal Server Error"
	let details: any

	// Handle Zod validation errors
	if (error instanceof ZodError) {
		statusCode = 400
		message = "Validation Error"
		details = error.errors.map((err) => ({
			field: err.path.join("."),
			message: err.message,
		}))
	}
	// Handle custom API errors
	else if (error instanceof ApiError) {
		statusCode = error.statusCode
		message = error.message
	}
	// Handle other known errors
	else if (error instanceof Error) {
		message = error.message
		if ("statusCode" in error && typeof error.statusCode === "number") {
			statusCode = error.statusCode
		}
	}

	// Log error
	logger.error(`${req.method} ${req.path} - ${statusCode} - ${message}`, {
		error: error.message,
		stack: isDevelopment ? error.stack : undefined,
		body: req.body,
		params: req.params,
		query: req.query,
	})

	// Send error response
	res.status(statusCode).json({
		success: false,
		error: message,
		...(details && { details }),
		...(isDevelopment && { stack: error.stack }),
	})
}

export const notFoundHandler = (req: Request, res: Response) => {
	const message = `Route ${req.method} ${req.path} not found`
	logger.warn(message)

	res.status(404).json({
		success: false,
		error: "Not Found",
		message,
	})
}
