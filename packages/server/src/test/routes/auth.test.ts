import request from "supertest"
import { describe, expect, it } from "vitest"
import { createApp } from "../../app"

describe("Auth Routes", () => {
	const app = createApp()

	describe("POST /api/auth/login", () => {
		it("should login with valid credentials", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({
					username: "user",
					password: "user",
				})
				.expect(200)

			expect(response.body).toMatchObject({
				success: true,
				data: {
					expires_in: "24h",
					user: { username: "user" },
				},
			})
			expect(response.body.data.token).toBeDefined()
			expect(typeof response.body.data.token).toBe("string")
		})

		it("should reject invalid credentials", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({
					username: "wrong",
					password: "wrong",
				})
				.expect(401)

			expect(response.body).toMatchObject({
				success: false,
				error: "Invalid credentials",
			})
		})

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({
					username: "",
					password: "",
				})
				.expect(400)

			expect(response.body.success).toBe(false)
			expect(response.body.error).toBe("Validation Error")
		})

		it("should handle missing fields", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({})
				.expect(400)

			expect(response.body.success).toBe(false)
		})
	})
})
