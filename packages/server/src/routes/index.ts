import { type Router as ExpressRouter, Router } from "express"
import authRoutes from "./auth"
import bookingRoutes from "./bookings"
import flightRoutes from "./flights"

const router: ExpressRouter = Router()

// Mount routes
router.use("/auth", authRoutes)
router.use("/flights", flightRoutes)
router.use("/bookings", bookingRoutes)

// API info endpoint
router.get("/", (_req, res) => {
	res.json({
		success: true,
		message: "Flight Booking API",
		version: "1.0.0",
		endpoints: {
			auth: "/api/auth",
			flights: "/api/flights",
			bookings: "/api/bookings",
		},
	})
})

export default router
