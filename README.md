# Flavour WebApp

A full-stack web application built for the Symrise Full-Stack Developer Assessment. It lets **Customers** build, revise, and submit custom flavor formulations for review, and lets **Flavorists** review, approve/reject, and comment on those submissions — with in-app notifications on both sides.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | SQLite (provided file, schema unmodified), accessed via the built-in `node:sqlite` module |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` (with legacy MD5 support for the pre-existing sample passwords) |
| Frontend | React 18 + Vite |
| Routing | react-router-dom v6 |
| HTTP client | axios |
| E2E verification | Playwright |

## Architecture

The backend follows a **hexagonal (ports & adapters) architecture**:

```
backend/src/
  domain/
    model/        Pure business objects (Flavor, User, Ingredient, Comment...) — no framework
                   dependencies. Owns every business rule from the assessment brief (≤5
                   ingredients, 5% increments, totals to 100%, versioning, state machine).
    port/in/       Interfaces describing the use cases the app supports (AuthPort, FlavorPort...).
    port/out/      Interfaces describing what the domain needs from persistence
                   (UserRepository, FlavorRepository...).
  application/     Concrete implementations of the input ports — the actual business logic
                   (AuthService, FlavorService, IngredientService, ReviewService).
  infrastructure/
    in/http/       Express app, routes, controllers, JWT/role middleware, error handler,
                   and the composition root (container.js) that wires everything together.
    out/persistence/  SQLite adapters implementing the output ports, plus the shared
                   database connection.

frontend/src/
  api/             axios wrappers per resource (flavorApi, reviewApi, ingredientApi).
  context/         AuthContext — session state, persisted to localStorage.
  router/          Route guards for authentication and role-based access.
  pages/           customer/ and flavorist/ screens, plus shared Login/Dashboard.
  components/      Reusable UI: IngredientPicker, FlavorForm, CommentSection, notifications...
  hooks/           useNotifications — polling-based, persisted per-user notification history.
```

Domain code never imports infrastructure code — the database and the HTTP framework are both
treated as replaceable adapters behind interfaces.

## Prerequisites

- Node.js **22 or later** (the backend uses the built-in `node:sqlite` module, added in Node 22)
- npm

## Setup and running locally

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (copy `.env.example` if present) with:

```
PORT=8080
JWT_SECRET=any_random_string_here
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

Make sure the provided database file is present at `backend/db/flavor_creation.db` (already
included in this repository).

```bash
npm run dev
```

You should see `Flavour API running on port 8080`. Verify with:

```bash
curl http://localhost:8080/api/health
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`. Open it in a browser.

## Test credentials

The provided database includes three sample users (all with password `password`):

| Login | Role |
|---|---|
| `rpatel@example.com` | customer |
| `jdupont@example.com` | flavorist |
| `jsmith@example.com` | admin |

## Project structure at a glance

- `backend/` — Node.js/Express REST API, hexagonal architecture, SQLite persistence
- `backend/db/flavor_creation.db` — the provided database file (schema and sample data untouched)
- `frontend/` — React + Vite single-page application
- Full commit history reflects incremental, individually-verified development: domain models →
  ports → persistence adapters → application services → HTTP layer → frontend, followed by
  several rounds of self-auditing that found and fixed real authorization, validation, and UX bugs.

## Notes on scope

- Notifications are implemented via client-side polling (every 15s) rather than WebSockets,
  since the provided schema has no notification table and cannot be modified.
- Passwords in the sample data are stored as legacy MD5 hashes; the auth service supports
  verifying against them for backward compatibility while using `bcrypt` for any new user.
- This setup targets local development, matching the assessment's scope. A production
  deployment would additionally need HTTPS termination, restricted CORS, a process manager or
  containerization, and a server-based database for concurrent write safety.
