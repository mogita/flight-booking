import type { NextFunction, Request, Response } from "express"
import { type JwtPayload, verifyToken } from "../utils/jwt"
import { ApiError } from "./error-handler"

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload
		}
	}
}

export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization
	const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

	if (!token) {
		return next(new ApiError("Access token required", 401))
	}

	try {
		const user = verifyToken(token)
		req.user = user
		next()
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Token verification failed"
		next(new ApiError(message, 401))
	}
}
