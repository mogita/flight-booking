-- Drop the old trip_type column from booking_trips and add trip_order as integer
ALTER TABLE "booking_trips" DROP COLUMN "trip_type";--> statement-breakpoint
ALTER TABLE "booking_trips" ADD COLUMN "trip_order" integer NOT NULL;--> statement-breakpoint
-- Add trip_type to bookings table
ALTER TABLE "bookings" ADD COLUMN "trip_type" varchar(20) NOT NULL;