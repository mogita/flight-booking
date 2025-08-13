import { Router } from "express"
import { z } from "zod"
import { ApiError } from "../middleware/error-handler"
import { validateRequest } from "../middleware/validation"
import { generateToken } from "../utils/jwt"
import { logger } from "../utils/logger"

const router = Router()

// Login schema
const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
})

// Hardcoded credentials as per requirements
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

			// Validate credentials
			if (
				username !== VALID_CREDENTIALS.username ||
				password !== VALID_CREDENTIALS.password
			) {
				logger.warn("Failed login attempt", { username, ip: req.ip })
				throw new ApiError("Invalid credentials", 401)
			}

			// Generate token
			const token = generateToken(username)

			logger.info("Successful login", { username, ip: req.ip })

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

export default router
