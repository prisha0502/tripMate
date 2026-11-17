# TripMate — Your Journey, Your Way

TripMate is a full-stack travel planning and itinerary management project. It helps travellers discover destinations, estimate a trip budget, organise activities by day, and keep their saved plans in one private dashboard.

## Problem statement

Planning a trip often means switching between destination research, budget notes and day-by-day plans. TripMate brings those basic planning tasks into one responsive application and demonstrates how a React client communicates with a Node/Express REST API using JSON.

## Objectives

- Make destination discovery useful through search, filters and sorting.
- Let travellers create an editable trip plan with dates, preferences and travellers.
- Calculate budget totals and per-person estimates as expenses change.
- Build a day-wise itinerary and save it with the trip.
- Demonstrate authentication, password hashing, role checks and persistent data.

## Technology

- **Frontend:** React, JavaScript, HTML5, CSS3, React Router, Fetch API, Vite
- **Backend:** Node.js, Express REST API
- **Persistence:** MongoDB Atlas when `MONGODB_URI` is configured; otherwise a local JSON file (`server/data/db.json`) keeps development simple.
- **Security libraries:** bcryptjs for password hashing and jsonwebtoken for signed sessions.

## Features

- Responsive home, Explore, About, destination detail, trip planner, My Trips, login/register and admin pages.
- Twenty-four seeded destinations across India, Asia, Europe, Oceania and the Americas, with sample attractions, activity ideas, tips and accommodation.
- Search by name/country/description, destination-type/location/budget filters, and name/budget sorting.
- Planner with date/traveller validation, preferences, accommodation and transport choices, live category totals and per-person calculation.
- Editable, time-ordered daily activities with descriptions and individual costs; itinerary dates follow trip dates.
- Authenticated trip create/read/update/delete. Trip data is scoped to its owner.
- Admin-only dashboard to view users and trips and add, edit or delete destinations.
- Graceful image fallback when an external Unsplash image cannot load.

## Architecture

The React client is built by Vite and served on port **5173**. Its Fetch API calls use `/api`; Vite proxies those requests to Express on port **4011**. Express routes validate input, check signed bearer tokens for private operations, and persist state in MongoDB Atlas in deployment or JSON locally. Passwords are stored as bcrypt hashes. Admin authorization is checked on the server as well as in the interface.

```text
client/
  src/
    App.jsx       Pages and reusable UI components
    Auth.jsx      Login, registration and session context
    api.js        Fetch API helper
    styles.css    Responsive design system
    main.jsx      React entry point and router providers
server/
  server.js       Express app, REST routes, seed data and JSON persistence
  data/db.json    Created on first server start (ignored by git)
```

## Setup and run

Requirements: Node.js 20 or newer and pnpm.

From the project root:

```powershell
./scripts/setup.cmd
node scripts/dev.js
```

The setup script sets the CI flag only for pnpm installation, avoiding a Windows symlink permission issue in managed workspaces. It restores the previous flag afterwards.

Or run the applications in separate terminals:

```powershell
node server/server.js
node scripts/dev-client.js
```

Open the frontend URL printed by Vite (normally **http://localhost:5173**; it uses the next port if 5173 is already occupied). The API health check is **http://127.0.0.1:4011/api/health**. If needed, set `TRIPMATE_API_PORT` before starting both processes to use another API port.

`node scripts/dev.js` builds the client and serves it with the Express API mounted in the same preview process. This keeps the one-command demo working in restricted Windows environments where separate child processes cannot reach one another over loopback. To see later source changes, stop the command and start it again; this local setup does not use hot reload. Run `node scripts/build.js` to create a production client bundle.

The production client bundle is written to `client/dist`.

### Open TripMate on another device

For devices on the **same Wi-Fi network**, run `node scripts/dev.js` from a normal terminal on the computer hosting the project, then open the `Network` URL printed by Vite on the phone or other computer. The host computer must remain on and the firewall must allow the selected port. A network URL printed inside the Codex sandbox may be private to that sandbox and unavailable to devices on your Wi-Fi.

For access from **anywhere on the internet at no hosting cost**, create a free MongoDB Atlas cluster, then deploy the project using the included `render.yaml` Blueprint on Render's Free plan. Push the project to GitHub, connect that repository in Render, and enter `MONGODB_URI`, a private `ADMIN_PASSWORD`, and a generated `JWT_SECRET` when prompted. Render assigns an HTTPS `onrender.com` address. Atlas holds trips and accounts persistently; Render's free web service can sleep after 15 minutes without traffic, so its first request after a quiet period may take around a minute. Free services can be restarted, so do not store production data in the local JSON file on Render.

To configure Atlas, create a Free cluster and a database user, allow Render network connections in Atlas Network Access, and copy the cluster connection string into Render's `MONGODB_URI` environment variable. Replace the username/password placeholders in the URI with the database user's credentials. Keep this URI private and never commit it to GitHub. Atlas Free clusters include up to 512 MB of storage.

The production start command serves the built React app and `/api` from one Express service. When `MONGODB_URI` is set, the backend stores users, trips and destinations in MongoDB Atlas. When it is absent, the backend uses the local JSON store for development.

### Demo admin account

- Email: `admin@tripmate.local`
- Password: `TripMate@2026`

On first server startup the development admin account is created with a bcrypt password hash. Set `ADMIN_PASSWORD` before starting the server to choose another initial password. The seeded account is created only if that email is absent from the JSON user store. This demo credential and the default JWT secret are for local development only; set `ADMIN_PASSWORD` and `JWT_SECRET` to private values before any shared deployment. Registration creates ordinary user accounts.

## REST API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and persistence status |
| GET | `/api/destinations` | Public | List destinations |
| GET | `/api/destinations/:id` | Public | Read destination details |
| POST | `/api/register` | Public | Create an account |
| POST | `/api/login` | Public | Authenticate and receive a signed token |
| GET | `/api/me` | Signed-in | Read the current profile |
| GET | `/api/trips` | Signed-in | List the current user's trips |
| POST | `/api/trips` | Signed-in | Save a trip and itinerary |
| PUT | `/api/trips/:id` | Trip owner | Update a saved trip |
| DELETE | `/api/trips/:id` | Trip owner | Delete a saved trip |
| GET | `/api/admin/overview` | Admin | View users, trips and destinations |
| POST | `/api/admin/destinations` | Admin | Add a destination |
| PUT | `/api/admin/destinations/:id` | Admin | Edit a destination |
| DELETE | `/api/admin/destinations/:id` | Admin | Delete a destination |

Protected calls send `Authorization: Bearer <token>`. JSON request and response bodies are used throughout.

## Database configuration

For local development, the JSON persistence fallback creates `server/data/db.json`; it contains sample destinations, registered users and saved trips. Keep this file private because it contains account metadata and password hashes. For a clean local demo reset, stop the backend and remove that file; the next start recreates the sample data and admin account. For deployment, configure `MONGODB_URI`; the backend uses a Mongoose model to persist TripMate's application state in Atlas. If Atlas is not configured on a public deployment, saved data will be lost when the free web service restarts.

## Screenshots

Screenshots can be added here after starting the application and capturing the home, Explore, planner, My Trips and admin pages.

## Limitations

- Destination information, accommodation examples and cost estimates are illustrative sample data, not live inventory or quotes.
- Destination photographs are loaded from Unsplash, so viewing those images requires internet access; the app replaces unavailable photos with a fallback image.
- The free Render service may have a cold start after inactivity and can restart; Atlas Free has limited storage and shared resources. This setup suits a college demo, not production workloads. Database normalization, migrations, password reset, email verification, refresh tokens and rate limiting are future hardening work.
- Trips can only be saved after registration/login; building and calculating a plan does not require a paid service.

## Future scope

- Add automated database migrations and more granular MongoDB collections.
- Add map-based discovery, destination comparison, collaborative trip sharing and export to PDF/calendar.
- Add live weather and transport/hotel integrations where appropriate credentials and terms allow.
- Add automated unit, API and browser tests and deploy with environment-specific secrets.

## Academic presentation notes

For a viva, trace a trip from the Explore page through the detail view, planner, live budget calculation and itinerary editor to the saved trip dashboard. Then demonstrate registration/login and the role-protected admin destination editor. The API table above gives a concise starting point for explaining the client-server data flow.
