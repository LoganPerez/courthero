# CourtHero

CourtHero is a full-stack web app for discovering pickleball events near a user-defined location. Enter a city or ZIP code, choose a search radius, and find nearby tournaments and open-play sessions — ordered by real geographic distance.

🏓 **Live demo:** _coming soon_

---

## Features

- Location search by city name or ZIP code
- Configurable radius (5 – 100 miles)
- Event types: Tournament and Open Play
- Real geospatial queries via PostGIS (`ST_DWithin`, `ST_Distance`)
- Geocoding via the Mapbox API
- CSV event import pipeline
- Event submission API (with auto-geocoding)
- `/about` landing page with tech stack and how-it-works explainer

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + PostGIS |
| Geocoding | Mapbox Geocoding API |
| Hosting | Vercel (frontend), Render (API), Supabase (database) |

---

## Architecture

```
User
  │
  ▼
React Frontend (Vercel)
  │
  │  REST API
  ▼
Express Backend (Render)
  │
  ├─────────────────────┐
  │                     │
  ▼                     ▼
Mapbox API         PostgreSQL + PostGIS (Supabase)
Geocoding          Spatial Event Search
```

---

## Local Development

### Prerequisites

- Node.js v20+
- Docker + Docker Compose
- A [Mapbox access token](https://account.mapbox.com/)

### 1 — Clone the repo

```bash
git clone https://github.com/LoganPerez/courthero.git
cd courthero
```

### 2 — Set up environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in your Mapbox token:

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
DATABASE_URL=postgresql://courthero:courthero@localhost:5432/courthero
```

### 3 — Start the database

```bash
docker compose up -d
```

This starts a PostGIS-enabled PostgreSQL container and runs `database/init.sql` automatically.

### 4 — Start the backend

```bash
cd server
npm install
npm run dev
```

API runs at: `http://localhost:3001`

### 5 — Start the frontend

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Deployment Guide (Free Tier)

### Step 1 — Supabase (Database)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In the **SQL Editor**, paste and run the contents of `database/init.sql`
4. Go to **Project Settings → Database** and copy the **Connection string (URI)**

### Step 2 — Render (Backend API)

1. Create a free account at [render.com](https://render.com)
2. Click **New → Blueprint** and connect your GitHub repo
   - Render will detect `render.yaml` automatically
3. In the **Environment** section of your new service, add these variables:
   - `DATABASE_URL` → paste the Supabase connection string
   - `MAPBOX_ACCESS_TOKEN` → your Mapbox token
   - `ALLOWED_ORIGIN` → your Vercel URL (add this after Step 3, then redeploy)
4. Deploy — your API URL will be `https://courthero-api.onrender.com` (or similar)

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after idle takes ~20–30 seconds to warm up. This is normal.

### Step 3 — Vercel (Frontend)

1. Create a free account at [vercel.com](https://vercel.com) (or log in)
2. Click **Add New → Project** and import your GitHub repo
3. Set the **Root Directory** to `client`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` → your Render API URL (e.g. `https://courthero-api.onrender.com`)
5. Deploy

### Step 4 — Wire CORS

1. Go back to your Render service → **Environment**
2. Set `ALLOWED_ORIGIN` to your Vercel URL (e.g. `https://courthero.vercel.app`)
3. Trigger a redeploy on Render

---

## API Reference

### Geocode a location

```http
GET /api/geocode?location=St.%20Louis
```

### Find nearby events

```http
GET /api/events?latitude=38.627&longitude=-90.198&radius=25
```

### Submit an event

```http
POST /api/events
Content-Type: application/json

{
  "name": "My Pickleball Tournament",
  "venue": "City Courts",
  "address": "123 Main St",
  "city": "St. Louis",
  "state": "MO",
  "startDate": "2026-11-01",
  "type": "Tournament"
}
```

---

## Author

**Logan Perez**  
Computer Science — Washington University in St. Louis  
[github.com/LoganPerez](https://github.com/LoganPerez)
