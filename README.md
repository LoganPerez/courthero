# CourtHero

CourtHero is a full-stack web application for discovering pickleball events near a user-defined location.

Users can enter a city or ZIP code, choose a search radius, and find nearby tournaments, open plays, leagues, and clinics. CourtHero uses geocoding and spatial database queries to return events ordered by geographic distance.

## Features

- Search for pickleball events by city or ZIP code
- Configurable search radius
- Geocoding through the Mapbox API
- Spatial event filtering with PostgreSQL and PostGIS
- Distance-based sorting of nearby events
- Event ingestion through CSV imports
- Event submission API with automatic venue geocoding
- Dockerized PostgreSQL/PostGIS database

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express
- TypeScript

### Database
- PostgreSQL
- PostGIS

### Tools and Services
- Docker
- Mapbox Geocoding API
- Git / GitHub

## Architecture

```text
User
  |
  v
React Frontend
  |
  | REST API
  v
Express Backend
  |
  +--------------------+
  |                    |
  v                    v
Mapbox API         PostgreSQL
Geocoding            + PostGIS
                        |
                        v
                Spatial Event Search
```
## How It Works

When a user searches for a location:

1. The React frontend sends the location to the Express backend.
2. The backend sends the location to the Mapbox Geocoding API.
3. Mapbox returns latitude and longitude coordinates.
4. The frontend requests events within the selected radius.
5. The backend queries PostgreSQL using PostGIS spatial functions.
6. Matching events are returned ordered by distance.
7. React displays the nearby events.

CourtHero uses PostGIS functions such as `ST_DWithin` and `ST_Distance` to perform geographic filtering.

## Event Ingestion

CourtHero supports importing event data from CSV files.

```text
Event Data
    |
    v
CSV Importer
    |
    v
Address Geocoding
    |
    v
Normalize Event Data
    |
    v
PostgreSQL / PostGIS
```

Imported event addresses are automatically geocoded before being stored in the database.

The database also stores source identifiers to help prevent duplicate event records.

## Event Submission API

CourtHero supports creating new events through the backend API.

```http
POST /api/events
```

The backend validates the submitted information, geocodes the event address, and stores the resulting geographic coordinates in PostGIS.

## Local Development

### Prerequisites

- Node.js
- npm
- Docker
- Docker Compose
- Mapbox access token

### Clone

```bash
git clone https://github.com/LoganPerez/courthero.git
cd courthero
```

### Environment Variables

Create:

```text
server/.env
```

Add:

```env
MAPBOX_ACCESS_TOKEN=your_mapbox_token
DATABASE_URL=postgresql://courthero:courthero@localhost:5432/courthero
```

### Start the Database

```bash
docker compose up -d
```

### Start the Backend

```bash
cd server
npm install
npm run dev
```

Backend:

```text
http://localhost:3001
```

### Start the Frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Example API Requests

### Geocode a Location

```http
GET /api/geocode?location=St.%20Louis
```

### Find Nearby Events

```http
GET /api/events?latitude=38.627464&longitude=-90.19835&radius=25
```

### Submit an Event

```http
POST /api/events
```

## Current Features

- Location geocoding
- Configurable radius search
- PostgreSQL/PostGIS spatial queries
- Distance calculations
- CSV event ingestion
- Event submission API
- Dockerized database

## Planned Improvements

- Interactive event map
- Event submission interface
- Admin approval workflow
- User accounts and saved events
- Automated ingestion from approved event sources
- Cloud deployment

## Author

**Logan Perez**  
Computer Science — Washington University in St. Louis
