import { createId } from "@paralleldrive/cuid2"
import {
	boolean,
	decimal,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core"

// Flights table - available flights in the system
export const flights = pgTable("flights", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	airline: varchar("airline", { length: 100 }).notNull(),
	flight_number: varchar("flight_number", { length: 20 }).notNull(),
	departure_time: timestamp("departure_time").notNull(),
	arrival_time: timestamp("arrival_time").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	source: varchar("source", { length: 100 }).notNull(),
	destination: varchar("destination", { length: 100 }).notNull(),
	departure_date: timestamp("departure_date").notNull(),
	arrival_date: timestamp("arrival_date").notNull(),
	is_round_trip: boolean("is_round_trip").default(false).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	deleted_at: timestamp("deleted_at"),
})

// Bookings table - financial and user information for a booking
export const bookings = pgTable("bookings", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	user_id: integer("user_id").notNull(), // For demo, always use 1
	fullname: varchar("fullname", { length: 200 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	phone: varchar("phone", { length: 50 }), // Optional
	trip_type: varchar("trip_type", { length: 20 }).notNull(), // one_way, round_trip, multi_stop
	total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	deleted_at: timestamp("deleted_at"),
})

// Booking trips table - journey segments within a booking
export const bookingTrips = pgTable("booking_trips", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	user_id: integer("user_id").notNull(),
	booking_id: text("booking_id")
		.references(() => bookings.id)
		.notNull(),
	trip_order: integer("trip_order").notNull(), // Order of this trip within the booking (1, 2, 3...)
	source_airport: varchar("source_airport", { length: 100 }).notNull(),
	destination_airport: varchar("destination_airport", {
		length: 100,
	}).notNull(),
	departure_time: timestamp("departure_time").notNull(), // Trip-level departure
	arrival_time: timestamp("arrival_time").notNull(), // Trip-level arrival
	total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	deleted_at: timestamp("deleted_at"),
})

// Booking flights table - individual flight details within a trip
export const bookingFlights = pgTable("booking_flights", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	user_id: integer("user_id").notNull(),
	booking_id: text("booking_id")
		.references(() => bookings.id)
		.notNull(),
	booking_trip_id: text("booking_trip_id")
		.references(() => bookingTrips.id)
		.notNull(),
	flight_order: integer("flight_order").notNull(), // Order within the trip (1, 2, 3...)
	// Flight details (copied from flights table)
	airline: varchar("airline", { length: 100 }).notNull(),
	flight_number: varchar("flight_number", { length: 20 }).notNull(),
	departure_time: timestamp("departure_time").notNull(),
	arrival_time: timestamp("arrival_time").notNull(),
	source_airport: varchar("source_airport", { length: 100 }).notNull(),
	destination_airport: varchar("destination_airport", {
		length: 100,
	}).notNull(),
	departure_date: timestamp("departure_date").notNull(),
	arrival_date: timestamp("arrival_date").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	deleted_at: timestamp("deleted_at"),
})

// Type exports
export type Flight = typeof flights.$inferSelect
export type NewFlight = typeof flights.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
export type BookingTrip = typeof bookingTrips.$inferSelect
export type NewBookingTrip = typeof bookingTrips.$inferInsert
export type BookingFlight = typeof bookingFlights.$inferSelect
export type NewBookingFlight = typeof bookingFlights.$inferInsert
