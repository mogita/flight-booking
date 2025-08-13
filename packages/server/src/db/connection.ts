import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Load environment variables from root .env file
dotenv.config({ path: "../../.env" })

const connectionString =
	process.env.DATABASE_URL ||
	"postgresql://mogita:mogita@localhost:5432/flight_booking"

// Create the connection
const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
})

// Create the database instance
export const db = drizzle(client, { schema })

// Export the client for direct queries if needed
export { client }
