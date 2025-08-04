# Rakuten Flight Booking Application - Implementation Plan

## Project Overview

This document outlines the implementation plan for a simplified flight booking application using React.js for the frontend and Node.js with Express for the backend. The application will allow users to search for flights, view results in a sortable manner, and book flights with passenger details.

## Architecture Overview

### Monorepo Structure
- **Package Manager**: pnpm with workspaces
- **Workspace Structure**:
  - `packages/web`: React frontend with Vite and SSR
  - `packages/server`: Node.js/Express backend with TypeScript
  - `packages/shared`: Shared types, constants, and utilities
- **Containerization**: Docker Compose with separate containers for web, server, and database

### Technology Stack

#### Frontend
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7 (with server-side rendering)
- **UI Library**: Shadcn UI with TailwindCSS
- **Theme**: Light and dark mode support (default: system preference)
- **Form Handling**: React Hook Form with Zod validation
- **Date Picker**: React Date Picker or similar
- **HTTP Client**: Fetch API

#### Backend
- **Runtime**: Node.js (>= v23.6.0)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Simple JWT-based authentication
- **Middleware**: helmet, cors, morgan, compression, rate-limiter
- **Validation**: Zod for request validation

#### Database
- **Primary Database**: PostgreSQL (local installation for development)
- **Schema**: Flights and Bookings tables with soft delete support

## Implementation Steps

### 1. Project Setup and Infrastructure

#### 1.1 Repository and Workspace Setup
- [x] Initialize Git repository
- [x] Set up pnpm workspace configuration
- [x] Create workspace structure (`packages/web`, `packages/server`, `packages/shared`)
- [x] Configure root-level package.json with workspace scripts
- [x] Set up Prettier configuration for code formatting
- [x] Create .gitignore and .env.example files

#### 1.2 Local PostgreSQL Setup
- [x] Use development database `flight_booking_dev` and user `mogita`
- [x] Set up connection configuration for local development

#### 1.3 Shared Package Setup
- [x] Initialize `packages/shared` with TypeScript
- [x] Define shared types for Flight, Booking, API responses
- [x] Create shared constants and utilities
- [x] Set up build configuration for shared package

### 2. Backend Development

#### 2.1 Database Setup
- [x] Set up Drizzle ORM configuration for local PostgreSQL
- [x] Create database schema for Flights table
- [x] Create database schema for Bookings table
- [x] Implement database migrations
- [x] Create seed data for flights (sample data)
- [x] Set up database connection and pooling

#### 2.2 Core Backend Infrastructure
- [x] Initialize Express application with TypeScript
- [x] Configure middleware (helmet, cors, morgan, compression, rate-limiter)
- [x] Set up error handling middleware
- [x] Implement request validation using Zod
- [x] Configure environment variables management
- [x] Set up logging system

#### 2.3 Authentication System
- [ ] Implement simple JWT token generation and validation
- [ ] Create authentication middleware
- [ ] Implement POST /login endpoint (hardcoded credentials)
- [ ] Add protected route middleware

#### 2.4 Flight API Endpoints
- [ ] Implement GET /flights endpoint with search functionality
  - [ ] Query parameters: source, destination, departure_date, is_round_trip
  - [ ] Server-side pagination support
  - [ ] Server-side sorting (price, departure_time, arrival_time)
  - [ ] Input validation and sanitization
- [ ] Implement GET /flights/:id endpoint
- [ ] Add comprehensive error handling and logging

#### 2.5 Booking API Endpoints
- [ ] Implement POST /bookings endpoint (protected)
- [ ] Implement GET /bookings endpoint (protected)
- [ ] Implement GET /bookings/:id endpoint (protected)
- [ ] Implement PUT /bookings/:id endpoint (protected)
- [ ] Implement DELETE /bookings/:id endpoint (soft delete, protected)
- [ ] Add booking validation and business logic

### 3. Frontend Development

#### 3.1 Frontend Infrastructure Setup
- [ ] Initialize Vite project with React and TypeScript
- [ ] Configure React Router v7 with SSR
- [ ] Set up Shadcn UI and TailwindCSS
- [ ] Configure light and dark theme support with system preference detection
- [ ] Configure build and development scripts
- [ ] Set up environment variables for API endpoints

#### 3.2 Theme System Implementation
- [ ] Set up theme provider with light/dark mode support
- [ ] Implement theme toggle component
- [ ] Configure TailwindCSS for theme variables
- [ ] Test theme switching functionality
- [ ] Ensure system preference detection works correctly

#### 3.3 Shared Components and Utilities
- [ ] Create reusable UI components (Button, Input, Card, etc.)
- [ ] Implement date picker component
- [ ] Create form validation utilities with Zod
- [ ] Set up API client with Fetch API and error handling
- [ ] Implement authentication context and hooks

#### 3.4 Flight Search Page
- [ ] Create flight search form component
  - [ ] Source city/airport input with validation
  - [ ] Destination city/airport input with validation
  - [ ] Departure date picker
  - [ ] Round trip toggle and return date picker
  - [ ] Form validation and error display
- [ ] Implement search functionality with API integration
- [ ] Add loading states and error handling

#### 3.5 Flight Listing Page
- [ ] Create flight list component with pagination
- [ ] Implement flight card component displaying:
  - [ ] Airline and flight number
  - [ ] Departure and arrival times
  - [ ] Price information
  - [ ] Book button
- [ ] Add sorting functionality (price, departure time, arrival time)
- [ ] Implement "No flights found" state
- [ ] Add loading and error states

#### 3.6 Booking Page
- [ ] Create booking page with flight details display
- [ ] Implement passenger details form:
  - [ ] Full name input with validation
  - [ ] Email input with validation
  - [ ] Phone number input (optional)
  - [ ] Form submission handling
- [ ] Add booking confirmation page
- [ ] Implement success and error states

#### 3.7 Authentication Pages
- [ ] Create login page with form validation
- [ ] Implement authentication flow
- [ ] Add protected route handling
- [ ] Create logout functionality

### 4. Integration and Testing

#### 4.1 End-to-End Integration
- [ ] Test complete user flow from search to booking
- [ ] Verify API integration and error handling
- [ ] Test authentication flow
- [ ] Validate form submissions and data persistence
- [ ] Test theme switching across all pages

#### 4.2 Error Handling and Edge Cases
- [ ] Implement comprehensive error boundaries
- [ ] Add network error handling
- [ ] Test edge cases (empty results, invalid dates, etc.)
- [ ] Validate input sanitization and security
- [ ] Test theme persistence and system preference changes

#### 4.3 Performance Optimization
- [ ] Optimize database queries for local PostgreSQL
- [ ] Implement proper caching strategies
- [ ] Optimize frontend bundle size
- [ ] Add loading states and skeleton screens
- [ ] Optimize theme switching performance

### 5. Documentation and Deployment

#### 5.1 Documentation
- [ ] Create comprehensive README.md with:
  - [ ] Project overview and architecture
  - [ ] Local PostgreSQL setup instructions
  - [ ] Development workflow
  - [ ] API documentation
  - [ ] Technology choices justification
  - [ ] Theme system documentation
- [ ] Document environment variables
- [ ] Create deployment guide

#### 5.2 Final Testing and Deployment
- [ ] Run final integration tests with local PostgreSQL
- [ ] Test Docker Compose setup
- [ ] Verify production build process
- [ ] Create deployment scripts
- [ ] Final code review and cleanup
- [ ] Test theme functionality in production build

## Development Workflow

### Step-by-Step Development Process
1. Complete each trackable step in sequence
2. Test functionality after each major component
3. Commit changes with descriptive messages
4. Update documentation as needed
5. Verify integration points between steps

### Quality Assurance
- Use TypeScript for type safety across all packages
- Implement comprehensive error handling
- Follow consistent code formatting with Prettier
- Use meaningful commit messages
- Test all user flows manually
- Validate API endpoints with proper tools
- Test theme switching in different browsers
- Verify local PostgreSQL integration

### Environment Management
- Development: Local PostgreSQL with hot reload
- Testing: Docker Compose with test database
- Production: Containerized deployment with optimized builds

## Success Criteria

- [ ] Users can search for flights with date, source, and destination
- [ ] Flight results display with proper sorting and pagination
- [ ] Users can book flights with passenger details
- [ ] Authentication system works correctly
- [ ] Application is responsive and user-friendly
- [ ] Code is well-documented and maintainable
- [ ] Docker Compose setup works for development and production
- [ ] All functional requirements are met

## Risk Mitigation

- **Database Issues**: Use local PostgreSQL for development with Docker fallback
- **API Integration**: Implement proper error handling and fallbacks
- **Authentication**: Use established simple JWT patterns and middleware
- **Frontend Complexity**: Use proven libraries (Shadcn UI, React Router)
- **Theme Implementation**: Test theme switching across different browsers and devices
- **Step Management**: Complete each trackable step before moving to the next

This implementation plan provides a structured, step-by-step approach to building the flight booking application while meeting all specified requirements and maintaining high code quality standards.
