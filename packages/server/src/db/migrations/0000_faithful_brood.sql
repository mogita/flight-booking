CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"flight_id" text NOT NULL,
	"fullname" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
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
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_flight_id_flights_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flights"("id") ON DELETE no action ON UPDATE no action;