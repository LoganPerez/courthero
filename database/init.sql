CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL
);

INSERT INTO events (
    name,
    city,
    state,
    event_date,
    event_type,
    location
)
VALUES
(
    'Forest Park Open Play',
    'St. Louis',
    'MO',
    '2026-09-26',
    'Open Play',
    ST_SetSRID(
        ST_MakePoint(-90.2847, 38.6386),
        4326
    )::geography
),
(
    'Gateway Pickleball Classic',
    'St. Louis',
    'MO',
    '2026-10-03',
    'Tournament',
    ST_SetSRID(
        ST_MakePoint(-90.1994, 38.6270),
        4326
    )::geography
),
(
    'Chesterfield Pickleball Night',
    'Chesterfield',
    'MO',
    '2026-10-08',
    'Open Play',
    ST_SetSRID(
        ST_MakePoint(-90.5771, 38.6631),
        4326
    )::geography
),
(
    'Kansas City Pickleball Tournament',
    'Kansas City',
    'MO',
    '2026-10-12',
    'Tournament',
    ST_SetSRID(
        ST_MakePoint(-94.5786, 39.0997),
        4326
    )::geography
);
