CREATE TABLE "booking_flights" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"booking_id" text NOT NULL,
	"booking_trip_id" text NOT NULL,
	"flight_order" integer NOT NULL,
	"airline" varchar(100) NOT NULL,
	"flight_number" varchar(20) NOT NULL,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"source_airport" varchar(100) NOT NULL,
	"destination_airport" varchar(100) NOT NULL,
	"departure_date" timestamp NOT NULL,
	"arrival_date" timestamp NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_trips" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"booking_id" text NOT NULL,
	"trip_type" varchar(20) NOT NULL,
	"source_airport" varchar(100) NOT NULL,
	"destination_airport" varchar(100) NOT NULL,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "round_trip_bookings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "round_trip_bookings" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_flight_id_flights_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_round_trip_booking_id_round_trip_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_booking_trip_id_booking_trips_id_fk" FOREIGN KEY ("booking_trip_id") REFERENCES "public"."booking_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_trips" ADD CONSTRAINT "booking_trips_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "flight_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "booking_type";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "round_trip_booking_id";