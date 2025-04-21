# Booking App

## Project Overview

This is a Rider Booking App backend service built with Node.js and Express. It provides booking management functionalities. The project uses Prisma as an ORM for database interactions and Winston for logging. Environment variables are managed using dotenv.

## Folder Structure

```
.
├── index.js                  # Application entry point, starts the server
├── package.json             # Project metadata and dependencies
├── prisma/                  # Prisma schema and migration files
│   └── schema.prisma        # Prisma schema definition
├── src/                     # Source code
│   ├── app.js               # Express app setup and route registration
│   ├── auth/                # Authentication module
│   │   ├── auth-controller.js  # Handles auth request logic
│   │   ├── auth-service.js     # Business logic for authentication
│   │   ├── auth-routes.js      # Express routes for auth endpoints
│   │   └── index.js            # Exports auth module components
│   ├── bookings/            # Booking module
│   │   ├── booking-controller.js  # Handles booking request logic
│   │   ├── booking-routes.js      # Express routes for booking endpoints
│   │   └── index.js              # Exports booking module components
│   ├── config/              # Configuration files
│   │   ├── index.js         # Exports config modules
│   │   ├── logger-config.js # Winston logger configuration
│   │   ├── server-config.js # Server configuration (e.g., port)
│   │   └── logs/            # Log files directory
│   ├── shared/              # Shared utilities and helpers
│   │   └── index.js         # Exports shared utilities
│
## Installation

1. Clone the repository:
```

```
2. Install dependencies:
```

npm install

```
3. Set up environment variables:
Create a `.env` file in the root directory and define necessary variables such as `PORT`.

4. Run the development server:
```

npm run dev

```

## Usage

- The server starts on the port defined in environment variables or defaults to 3000.
- Authentication routes are available under `/api/auth` (e.g., POST `/api/auth/login`).
- Booking routes are expected to be available (though not registered in the main app file currently).

## Dependencies

- express: Web framework
- dotenv: Environment variable management
- http-status-codes: HTTP status code constants
- nodemon: Development server auto-restart
- winston: Logging
- prisma: ORM for database
```
