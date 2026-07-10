# Fix It Now

FixItNow is a backend API for a home services marketplace. Customers can browse available services (plumbing, electrical, cleaning, painting, etc.), book qualified technicians, and leave reviews. Technicians can create service profiles, manage availability, and handle job bookings. Admins oversee the platform, manage users, and moderate service categories.

> This README documents the API endpoints, authentication, request/response examples, and operational notes needed to run and integrate with the service.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
    - [Auth](#auth)
    - [Services & Technicians (Public)](#services--technicians-public)
    - [Bookings](#bookings)
    - [Payments (Stripe)](#payments-stripe)
    - [Technician Management](#technician-management)
    - [Reviews](#reviews)
    - [Admin](#admin)
  - [Error Responses](#error-responses)
  - [Pagination](#pagination)
  - [Webhook Notes](#webhook-notes)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

Fix It Now provides a RESTful JSON API for a home services marketplace. Key actors:

- Customers: browse services, book technicians, make payments, leave reviews.
- Technicians: create and manage profiles, availability, accept or decline bookings, mark jobs complete.
- Admins: manage users, bookings, and service categories.

This README describes the API surface and examples. Adjust base URL and auth details to match your deployment.


## Features

- JWT-based authentication
- Public service and technician discovery endpoints
- Booking workflow with technician acceptance and payment integration (Stripe)
- Technician availability and booking management
- Reviews and moderation by admins
- Pagination, filtering, and standardized error responses


## Prerequisites

- Node.js (recommended >= 14) or your chosen runtime
- npm or yarn
- prisma
- PostgreSQL / MySQL / MongoDB (adjust as needed)
- Stripe account and API keys (for payments)


## Installation

1. Clone the repository

   git clone <repository-url>
   cd <repository-folder>

2. Install dependencies

   npm install
   # or
   yarn install


## Configuration

Create a `.env` file in the project root with these example variables:

```
# Server
PORT=5000

# Auth
JWT_SECRET=replace_with_strong_secret
JWT_REFRESH=replace_with_strong_secret

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/fixitnow

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
LOG_LEVEL=info
```


## Running the Application

Start the server (example):

npm run start
# or (development)
npm run dev

Default base URL for local development:

```
https://fix-it-now-silk.vercel.app
```

API base path used in this documentation:

```
/api
```

(Example: https://fix-it-now-silk.vercel.app/api/auth/login)

## Postman / API Documentation

A public Postman documentation for this API is available:

https://documenter.getpostman.com/view/55121364/2sBY4LR2aC

To import the collection into Postman:

1. Open Postman -> Import -> Link
2. Paste the URL above and import the collection and environment as needed.


## API Documentation

All endpoints accept and return JSON unless otherwise stated. Include the Authorization header for protected endpoints:

Authorization: Bearer <jwt>


### Authentication

- POST /api/auth/register
  - Description: Register a new user (role: "customer" or "technician")
  - Request Body (example):
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "P@ssw0rd",
      "role": "customer"        // or "technician"
    }
  - Responses:
    - 201 Created
      {
        "id": "user-id",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer"
      }
    - 400 Bad Request — validation errors

- POST /api/auth/login
  - Description: Login and receive JWT
  - Request Body:
    {
      "email": "jane@example.com",
      "password": "P@ssw0rd"
    }
  - Responses:
    - 200 OK
      {
        "token": "<jwt>",
        "user": { "id": "user-id", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
      }
    - 401 Unauthorized — invalid credentials

- GET /api/auth/me
  - Description: Get current authenticated user
  - Auth: Required
  - Responses:
    - 200 OK — user object
    - 401 Unauthorized


### Services & Technicians (Public)

- GET /api/services
  - Description: Get all services. Supports filtering by type, location, minRating, category, pagination
  - Query params (examples): ?type=plumbing&city=Dhaka&minRating=4&page=1&limit=20
  - Response: 200 OK — paginated list of services

- GET /api/technicians
  - Description: Get all technicians. Supports filters (serviceType, location, rating, availability)
  - Query params: ?serviceType=electrical&city=Dhaka&page=1&limit=20
  - Response: 200 OK — paginated list of technician summaries

- GET /api/technicians/:id
  - Description: Get full technician profile including services offered, availability, and reviews
  - Response: 200 OK — technician object

- GET /api/categories
  - Description: Get all service categories
  - Response: 200 OK — list of categories


### Bookings

- POST /api/bookings
  - Description: Customer creates a new booking request
  - Auth: Required (customer)
  - Request Body (example):
    {
      "technicianId": "tech-id",
      "serviceId": "service-id",
      "scheduledAt": "2026-07-15T10:00:00Z",
      "address": "123 Main St, Dhaka",
      "notes": "Fix leaking pipe"
    }
  - Responses:
    - 201 Created — booking created; initial status: "pending"
    - 400 Bad Request — validation

- GET /api/bookings
  - Description: Get bookings for the authenticated user (customers see their bookings; technicians see bookings assigned to them)
  - Auth: Required
  - Query params: ?page=1&limit=20
  - Response: 200 OK — paginated bookings

- GET /api/bookings/:id
  - Description: Get booking details
  - Auth: Required (customer who created booking, assigned technician, or admin)
  - Response: 200 OK — booking object


### Payments (Stripe)

- POST /api/payments/create
  - Description: Create a Stripe payment session for an accepted booking
  - Auth: Required (customer)
  - Request Body: { "bookingId": "..." }
  - Response: 200 OK — { "sessionId": "...", "checkoutUrl": "https://checkout.stripe.com/.." }

- POST /api/payments/webhook
  - Description: Stripe webhook endpoint to receive payment events (e.g., checkout.session.completed)
  - Auth: Not authenticated via JWT — validate using STRIPE_WEBHOOK_SECRET and raw body signature
  - Notes: Acknowledge with 2xx. Update booking/payment status on successful payment.

- GET /api/payments
  - Description: Get authenticated user's payment history
  - Auth: Required
  - Response: 200 OK — list of payments

- GET /api/payments/:id
  - Description: Get payment details
  - Auth: Required (owner or admin)
  - Response: 200 OK — payment object


### Technician Management

- PUT /api/technician/profile
  - Description: Create or update technician profile (bio, skills, services offered, pricing)
  - Auth: Required (technician)
  - Request Body (example):
    {
      "bio": "Experienced plumber",
      "services": ["service-id-1", "service-id-2"],
      "hourlyRate": 15
    }
  - Response: 200 OK — updated profile

- PUT /api/technician/:id/availability
  - Description: Update availability slots for technician
  - Auth: Required (technician or admin)
  - Request Body (example):
    {
      "slots": [
        { "start": "2026-07-16T09:00:00Z", "end": "2026-07-16T12:00:00Z" },
        { "start": "2026-07-17T14:00:00Z", "end": "2026-07-17T18:00:00Z" }
      ]
    }
  - Response: 200 OK

- GET /api/technician/bookings
  - Description: Get bookings assigned to the authenticated technician
  - Auth: Required (technician)
  - Response: 200 OK — paginated bookings

- PATCH /api/technician/bookings/:id
  - Description: Update booking status for technician (accept/decline/complete)
  - Auth: Required (assigned technician)
  - Request Body: { "status": "accepted" } // accepted | declined | completed
  - Response: 200 OK — updated booking


### Reviews

- POST /api/reviews
  - Description: Create a review after job completion
  - Auth: Required (customer who completed booking)
  - Request Body (example):
    {
      "bookingId": "booking-id",
      "technicianId": "tech-id",
      "rating": 5,
      "comment": "Great work, fast and professional"
    }
  - Response: 201 Created — review object

- DELETE /api/reviews/:id
  - Description: Delete a review (owner or admin)
  - Auth: Required
  - Response: 204 No Content


### Admin

- GET /api/admin/users
  - Description: Get all users (paginated)
  - Auth: Required (admin)
  - Response: 200 OK

- PATCH /api/admin/users/:id
  - Description: Update user status (e.g., activate / block)
  - Auth: Required (admin)
  - Request Body: { "status": "active" } // or "blocked"
  - Response: 200 OK — updated user

- GET /api/admin/bookings
  - Description: Get all bookings across platform (admin)
  - Auth: Required (admin)
  - Response: 200 OK — paginated

- GET /api/categories
  - Description: Get all categories (public/admin)
  - Response: 200 OK

- POST /api/admin/categories
  - Description: Create new service category
  - Auth: Required (admin)
  - Request Body: { "name": "Carpentry", "description": "..." }
  - Response: 201 Created — category object


## Error Responses

All errors follow a standardized envelope. Example:

```
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "message": "One or more fields failed validation",
    "code": "VALIDATION_FAILED",
    "details": [ { "field": "email", "message": "Email is required" } ]
  }
}
```

Common HTTP status codes used by the API:

- 200 OK — success
- 201 Created — resource created
- 204 No Content — success with no body
- 400 Bad Request — validation or malformed input
- 401 Unauthorized — missing/invalid token
- 403 Forbidden — authenticated but unauthorized for action
- 404 Not Found — resource does not exist
- 409 Conflict — e.g., double booking or unique constraint
- 422 Unprocessable Entity — semantic validation
- 429 Too Many Requests — rate limited
- 500 Internal Server Error — unexpected failure

## Webhook Notes

- The Stripe webhook endpoint (`POST /api/payments/webhook`) must verify the signature using `STRIPE_WEBHOOK_SECRET` and parse the raw request body.
- Respond with 2xx when events are processed successfully. Handle idempotency for repeated events.


## Booking Flow (Diagram)

Customer:
Register -> Login -> Browse Services -> View Technician Profiles -> Book Technician -> Technician Accepts Booking -> Make Payment -> Technician Completes Job -> Leave Review

Technician:
Register as Technician -> Login -> Create Technician Profile -> Add Services -> Accept / Decline Bookings -> Complete Job


## License

Specify your license (e.g., MIT). Replace this section with the project's license details.


## Contact

Maintainer: Imran Ali — md.imranali2046@gmail.com


---