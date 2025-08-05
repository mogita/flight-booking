CREATE TABLE "round_trip_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"outbound_booking_id" text NOT NULL,
	"return_booking_id" text NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_type" varchar(20) DEFAULT 'one_way' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "round_trip_booking_id" text;--> statement-breakpoint
ALTER TABLE "round_trip_bookings" ADD CONSTRAINT "round_trip_bookings_outbound_booking_id_bookings_id_fk" FOREIGN KEY ("outbound_booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_trip_bookings" ADD CONSTRAINT "round_trip_bookings_return_booking_id_bookings_id_fk" FOREIGN KEY ("return_booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_round_trip_booking_id_round_trip_bookings_id_fk" FOREIGN KEY ("round_trip_booking_id") REFERENCES "public"."round_trip_bookings"("id") ON DELETE no action ON UPDATE no action;