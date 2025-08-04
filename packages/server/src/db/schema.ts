import { pgTable, text, varchar, timestamp, decimal, boolean } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const flights = pgTable('flights', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  airline: varchar('airline', { length: 100 }).notNull(),
  flight_number: varchar('flight_number', { length: 20 }).notNull(),
  departure_time: timestamp('departure_time').notNull(),
  arrival_time: timestamp('arrival_time').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  source: varchar('source', { length: 100 }).notNull(),
  destination: varchar('destination', { length: 100 }).notNull(),
  departure_date: timestamp('departure_date').notNull(),
  arrival_date: timestamp('arrival_date').notNull(),
  is_round_trip: boolean('is_round_trip').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  flight_id: text('flight_id').references(() => flights.id).notNull(),
  fullname: varchar('fullname', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

export type Flight = typeof flights.$inferSelect
export type NewFlight = typeof flights.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
