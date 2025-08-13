import { z } from "zod"

// Flight search validation schema
export const flightSearchSchema = z
	.object({
		source: z.string().min(1, "Source city is required"),
		destination: z.string().min(1, "Destination city is required"),
		departureDate: z.date({
			required_error: "Departure date is required",
			invalid_type_error: "Please select a valid date",
		}),
		returnDate: z.date().optional(),
		isRoundTrip: z.boolean().default(false),
	})
	.refine(
		(data) => {
			// If round trip, return date is required
			if (data.isRoundTrip && !data.returnDate) {
				return false
			}
			// Return date should be after departure date
			if (
				data.returnDate &&
				data.departureDate &&
				data.returnDate <= data.departureDate
			) {
				return false
			}
			return true
		},
		{
			message: "Return date must be after departure date",
			path: ["returnDate"],
		},
	)

// Booking validation schema
export const bookingSchema = z.object({
	flightId: z.string().min(1, "Flight ID is required"),
	fullname: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(200, "Full name must be less than 200 characters")
		.regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
	email: z
		.string()
		.email("Please enter a valid email address")
		.min(1, "Email is required"),
	phone: z
		.string()
		.optional()
		.nullable()
		.transform((val) => val?.trim() || "")
		.refine((val) => !val || val === "" || /^\+[1-9]\d{1,14}$/.test(val), {
			message: "Please enter a valid phone number (e.g., +1234567890)",
		}),
})

// Payment validation schema
export const paymentSchema = z.object({
	cardNumber: z
		.string()
		.min(1, "Card number is required")
		.regex(/^[\d\s]{13,19}$/, "Please enter a valid card number"),
	expiryDate: z
		.string()
		.min(1, "Expiry date is required")
		.regex(
			/^(0[1-9]|1[0-2])\/([0-9]{2})$/,
			"Please enter a valid expiry date (MM/YY)",
		),
	cvv: z
		.string()
		.min(1, "CVV is required")
		.regex(/^[0-9]{3,4}$/, "Please enter a valid CVV"),
	cardholderName: z
		.string()
		.min(2, "Cardholder name must be at least 2 characters")
		.max(100, "Cardholder name must be less than 100 characters")
		.regex(
			/^[a-zA-Z\s\-'\.]+$/,
			"Cardholder name can only contain letters, spaces, hyphens, apostrophes, and periods",
		),
})

// Combined booking and payment schema
export const fullBookingSchema = bookingSchema.merge(paymentSchema)

// Login validation schema
export const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
})

// Form field validation helpers
export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
	if (!phone) return true // Phone is optional
	const e164Regex = /^\+[1-9]\d{1,14}$/
	return e164Regex.test(phone)
}

export const validateName = (name: string): boolean => {
	return name.length >= 2 && name.length <= 200 && /^[a-zA-Z\s]+$/.test(name)
}

export const validateFutureDate = (date: Date): boolean => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	return date >= today
}

// Type exports
export type FlightSearchFormData = z.infer<typeof flightSearchSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
export type LoginFormData = z.infer<typeof loginSchema>
