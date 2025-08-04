Tech stack:

- Node.js (>= v23.6.0)
- Express (middlewares: helmet, cors, morgan, compression, rate-limiter, etc.)
- TypeScript
- Drizzle (ORM)
- PostgreSQL

Database structure:

- Flights table:
  - id (primary key)
  - airline
  - flight_number
  - departure_time
  - arrival_time
  - price
  - source
  - destination
  - departure_date
  - arrival_date
  - is_round_trip (boolean)
  - created_at
  - updated_at
  - deleted_at (soft delete)
- Bookings table:
  - id (primary key)
  - flight_id (foreign key)
  - fullname
  - email
  - phone
  - created_at
  - updated_at
  - deleted_at (soft delete)

API endpoints:

Flights:

- GET /flights: Search for flights based on query parameters (source, destination, departure_date, etc.)
- GET /flights/:id: Get a specific flight by ID

Bookings:

- GET /bookings: Get all bookings
- GET /bookings/:id: Get a specific booking by ID
- POST /bookings: Create a new booking
- PUT /bookings/:id: Update a booking
- DELETE /bookings/:id: Soft delete a booking

Authentication:

- JWT-based authentication for protected routes (requires login to book a flight, but not to search for flights)
- POST /login: User login (for this demo project, hard code "user" and "user" as credentials)
