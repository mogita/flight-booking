import { createId } from "@paralleldrive/cuid2"
import {
	boolean,
	decimal,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core"

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

export const bookings = pgTable("bookings", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	flight_id: text("flight_id")
		.references(() => flights.id)
		.notNull(),
	fullname: varchar("fullname", { length: 200 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	phone: varchar("phone", { length: 50 }),
	booking_type: varchar("booking_type", { length: 20 })
		.default("one_way")
		.notNull(),
	round_trip_booking_id: text("round_trip_booking_id").references(
		() => roundTripBookings.id,
	),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	deleted_at: timestamp("deleted_at"),
})

export const roundTripBookings = pgTable("round_trip_bookings", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	outbound_booking_id: text("outbound_booking_id")
		.references(() => bookings.id)
		.notNull(),
	return_booking_id: text("return_booking_id")
		.references(() => bookings.id)
		.notNull(),
	total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	updated_at: timestamp("updated_at").defaultNow().notNull(),
	deleted_at: timestamp("deleted_at"),
})

export type Flight = typeof flights.$inferSelect
export type NewFlight = typeof flights.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
export type RoundTripBooking = typeof roundTripBookings.$inferSelect
export type NewRoundTripBooking = typeof roundTripBookings.$inferInsert
