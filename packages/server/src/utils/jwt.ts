import jwt, { type SignOptions } from "jsonwebtoken"
import { env } from "../config/env"

export interface JwtPayload {
	username: string
	iat?: number
	exp?: number
}

export const generateToken = (username: string): string => {
	// @ts-ignore - JWT expiresIn type issue
	const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN }
	return jwt.sign({ username }, env.JWT_SECRET, options)
}

export const verifyToken = (token: string): JwtPayload => {
	try {
		return jwt.verify(token, env.JWT_SECRET) as JwtPayload
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new Error("Token expired")
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new Error("Invalid token")
		}
		throw new Error("Token verification failed")
	}
}
