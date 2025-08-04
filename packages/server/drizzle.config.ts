import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://mogita:mogita@localhost:5432/flight_booking',
  },
  verbose: true,
  strict: true,
})
