import { Router } from "express"
import { z } from "zod"
import { ApiError } from "../middleware/error-handler"
import { validateRequest } from "../middleware/validation"
import { generateToken, verifyToken } from "../utils/jwt"
import { logger } from "../utils/logger"

const router: Router = Router()

const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
})

const VALID_CREDENTIALS = {
	username: "user",
	password: "user",
}

router.post(
	"/login",
	validateRequest({ body: loginSchema }),
	async (req, res, next) => {
		try {
			const { username, password } = req.body

			if (
				username !== VALID_CREDENTIALS.username ||
				password !== VALID_CREDENTIALS.password
			) {
				throw new ApiError("Invalid credentials", 401)
			}

			const token = generateToken(username)

			res.json({
				success: true,
				data: {
					token,
					expires_in: "24h",
					user: { username },
				},
			})
		} catch (error) {
			next(error)
		}
	},
)

// Token validation endpoint
router.post("/validate", async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization
		const token = authHeader?.split(" ")?.[1]

		if (!token) {
			throw new ApiError("Access token required", 401)
		}

		// Verify token using server-side validation
		const payload = verifyToken(token)

		res.json({
			success: true,
			data: {
				user: { username: payload.username },
				valid: true,
			},
		})
	} catch (error) {
		logger.warn("Token validation failed", {
			error: error instanceof Error ? error.message : "Unknown error",
			ip: req.ip,
		})

		// Return 401 for any token validation errors
		const message =
			error instanceof Error ? error.message : "Token validation failed"
		next(new ApiError(message, 401))
	}
})

export default router
