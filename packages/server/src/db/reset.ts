import { sql } from "drizzle-orm"
import { client, db } from "./connection"

async function resetDatabase() {
	console.log("Resetting database...")

	try {
		// Drop tables if they exist (in correct order due to dependencies)
		await db.execute(sql`DROP TABLE IF EXISTS round_trip_bookings CASCADE`)
		await db.execute(sql`DROP TABLE IF EXISTS bookings CASCADE`)
		await db.execute(sql`DROP TABLE IF EXISTS flights CASCADE`)
		await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`)

		console.log("Dropped existing tables")
		console.log("Database reset completed successfully!")
	} catch (error) {
		console.error("Database reset failed:", error)
		process.exit(1)
	} finally {
		await client.end()
	}
}

resetDatabase()
