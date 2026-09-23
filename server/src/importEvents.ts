import fs from "fs";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

type MapboxGeocodeResponse = {
  features: Array<{
    geometry: { coordinates: [number, number] };
    properties: { full_address?: string; name?: string };
  }>;
};

type CsvEvent = {
  source_event_id: string;
  name: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  start_date: string;
  end_date: string;
  type: string;
  registration_url: string;
  source: string;
};

async function geocodeAddress(address: string) {
  const token = process.env.MAPBOX_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Missing MAPBOX_ACCESS_TOKEN");
  }

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward` +
      `?q=${encodeURIComponent(address)}` +
      `&access_token=${token}` +
      `&limit=1`
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed for ${address}`);
  }

  const data = await response.json() as MapboxGeocodeResponse;

  if (!data.features || data.features.length === 0) {
    throw new Error(`No coordinates found for ${address}`);
  }

  const [longitude, latitude] =
    data.features[0].geometry.coordinates;

  return {
    latitude,
    longitude,
  };
}

async function importEvents() {
  const csv = fs.readFileSync(
    "./data/events.csv",
    "utf-8"
  );

  const events = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvEvent[];

  for (const event of events) {
    try {
      const fullAddress =
        `${event.address}, ${event.city}, ${event.state}`;

      console.log(`Importing: ${event.name}`);

      const { latitude, longitude } =
        await geocodeAddress(fullAddress);

      await pool.query(
        `
        INSERT INTO events (
          name,
          city,
          state,
          event_date,
          event_type,
          location,
          venue,
          end_date,
          registration_url,
          source,
          source_event_id
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          ST_SetSRID(
            ST_MakePoint($6, $7),
            4326
          )::geography,
          $8,
          $9,
          $10,
          $11,
          $12
        )
        ON CONFLICT (source, source_event_id)
        DO UPDATE SET
          name = EXCLUDED.name,
          event_date = EXCLUDED.event_date,
          end_date = EXCLUDED.end_date,
          location = EXCLUDED.location,
          venue = EXCLUDED.venue,
          registration_url = EXCLUDED.registration_url;
        `,
        [
          event.name,
          event.city,
          event.state,
          event.start_date,
          event.type,
          longitude,
          latitude,
          event.venue,
          event.end_date,
          event.registration_url,
          event.source,
          event.source_event_id,
        ]
      );

      console.log(`Imported: ${event.name}`);
    } catch (error) {
      console.error(
        `Failed to import ${event.name}`,
        error
      );
    }
  }

  await pool.end();
  console.log("Import complete.");
}

importEvents();
