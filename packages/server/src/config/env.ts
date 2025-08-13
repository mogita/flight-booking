import dotenv from "dotenv"
import { z } from "zod"

// Load environment variables from root .env file
dotenv.config({ path: "../../.env" })

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().transform(Number).default("3000"),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
	JWT_EXPIRES_IN: z.string().default("24h"),
})

export const env = envSchema.parse(process.env)

export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"
export const isTest = env.NODE_ENV === "test"
