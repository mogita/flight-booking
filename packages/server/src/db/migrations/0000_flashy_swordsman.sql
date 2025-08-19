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
	"trip_order" integer NOT NULL,
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
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"fullname" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"trip_type" varchar(20) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" text PRIMARY KEY NOT NULL,
	"airline" varchar(100) NOT NULL,
	"flight_number" varchar(20) NOT NULL,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"source" varchar(100) NOT NULL,
	"destination" varchar(100) NOT NULL,
	"departure_date" timestamp NOT NULL,
	"arrival_date" timestamp NOT NULL,
	"is_round_trip" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_booking_trip_id_booking_trips_id_fk" FOREIGN KEY ("booking_trip_id") REFERENCES "public"."booking_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_trips" ADD CONSTRAINT "booking_trips_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;