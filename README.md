# Flight Booking Application

A full-stack flight booking application with search, sorting, and booking functionality.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm (monorepo)

## Key Libraries

- **React Hook Form + Zod**: Form handling and validation - type-safe forms with minimal boilerplate
- **Tailwind CSS**: Utility-first CSS - rapid UI development with consistent design
- **Drizzle ORM**: Type-safe database queries - better developer experience than raw SQL
- **Vitest**: Testing framework - fast and modern alternative to Jest
- **Express**: Web framework - minimal and flexible for REST APIs

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers (both frontend and backend)
pnpm dev

# Or start individually
pnpm dev:web    # Frontend only (http://localhost:5173)
pnpm dev:server # Backend only (http://localhost:3000)
```

## Testing

```bash
pnpm test        # Run all tests
pnpm test:web    # Frontend tests only
pnpm test:server # Backend tests only
```

## License

MIT
