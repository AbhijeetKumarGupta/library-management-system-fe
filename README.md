# Library Management System — Frontend

A lightweight React frontend for the [Library Management System](../library-management-system) Spring Boot API.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — fast dev server and builds
- **Tailwind CSS v4** — utility-first styling, no heavy UI framework
- **React Router** — client-side routing
- **Lucide React** — minimal icon set

## Features

- **Dashboard** — overview stats and recent transactions
- **Books** — CRUD with search and availability badges
- **Students** — paginated list with card assignment
- **Library Cards** — card grid with status management
- **Transactions** — borrow/return workflow with validation-aware book lists

## Prerequisites

- Node.js 18+
- Backend running at `http://localhost:SERVER_PORT` (see backend `.env` for `SERVER_PORT`)

## Quick Start

```bash
cd library-management-system-fe
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies `/api` requests to `http://localhost:SERVER_PORT`, so no CORS setup is required during local development.

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable            | Default   | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `VITE_API_BASE_URL` | `/api/v1` | API base path (use full URL in production) |

For production builds pointing at a remote API:

```env
VITE_API_BASE_URL=http://your-server:SERVER_PORT/api/v1
```

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start dev server on port 5173       |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview production build            |

## Backend CORS

A `WebConfig` CORS bean was added to the Spring Boot backend to allow requests from `http://localhost:5173` when not using the Vite proxy (e.g. production deployments).

## Recommended Workflow

1. Start MySQL and create the `library_management_system` database
2. Run the backend: `./mvnw spring-boot:run` (from the backend directory)
3. Create library cards first
4. Register students and assign cards
5. Add books, then issue/return via Transactions

## Project Structure

```text
src/
├── api/           # REST client modules
├── components/    # Layout and reusable UI
├── context/       # Toast notifications
├── hooks/         # Shared hooks
├── pages/         # Route pages
└── types/         # TypeScript interfaces
```
