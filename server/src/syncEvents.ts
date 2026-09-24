/**
 * CourtHero — Automated Event Sync Script
 *
 * Reads upcoming-events.json (a curated, version-controlled manifest),
 * geocodes each address via Mapbox, and upserts into Supabase using
 * (source, source_event_id) deduplication — so re-running is always safe.
 *
 * Usage (local):  npm run sync
 * Usage (CI):     Triggered automatically by .github/workflows/sync-events.yml
 *                 every Sunday at 9 AM UTC, or on any push that changes
 *                 server/data/upcoming-events.json.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

// ── Types ────────────────────────────────────────────────────

type EventManifestEntry = {
  source_event_id: string;
  source: string;
  name: string;
  venue: string;
  address: string; // Full address: "123 Main St, City, ST"
  start_date: string;
  end_date: string | null;
  event_type: string;
  registration_url: string | null;
};

type MapboxGeocodeResponse = {
  features: Array<{
    geometry: { coordinates: [number, number] };
    properties: { full_address?: string; name?: string };
  }>;
};

// ── Helpers ──────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number }> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;

  if (!token) {
    throw new Error("MAPBOX_ACCESS_TOKEN is not set");
  }

  const url =
    `https://api.mapbox.com/search/geocode/v6/forward` +
    `?q=${encodeURIComponent(address)}` +
    `&access_token=${token}` +
    `&limit=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Mapbox returned ${response.status} for address: ${address}`
    );
  }

  const data = (await response.json()) as MapboxGeocodeResponse;

  if (!data.features || data.features.length === 0) {
    throw new Error(`No coordinates found for: ${address}`);
  }

  const [longitude, latitude] = data.features[0].geometry.coordinates;
  return { latitude, longitude };
}

// ── Main ──────────────────────────────────────────────────────

async function syncEvents() {
  const manifestPath = path.join(__dirname, "..", "data", "upcoming-events.json");
  const rawJson = fs.readFileSync(manifestPath, "utf-8");
  const events: EventManifestEntry[] = JSON.parse(rawJson);

  console.log(`\n🏓 CourtHero Event Sync — ${new Date().toISOString()}`);
  console.log(`📋 Manifest contains ${events.length} events\n`);

  let inserted = 0;
  let updated  = 0;
  let failed   = 0;

  for (const event of events) {
    try {
      process.stdout.write(`  → Geocoding: ${event.address} ... `);
      const { latitude, longitude } = await geocodeAddress(event.address);
      console.log(`✓ (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

      // Parse "address, City, ST" into components for storage
      const parts  = event.address.split(",").map((p) => p.trim());
      const street = parts[0] ?? "";
      const city   = parts[1] ?? "";
      const state  = parts[2] ?? "";

      // Determine if this is a new insert or an update
      const existing = await pool.query(
        `SELECT id FROM events WHERE source = $1 AND source_event_id = $2`,
        [event.source, event.source_event_id]
      );
      const isNew = existing.rows.length === 0;

      await pool.query(
        `
        INSERT INTO events (
          name,
          venue,
          address,
          city,
          state,
          event_date,
          end_date,
          event_type,
          registration_url,
          location,
          source,
          source_event_id
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          ST_SetSRID(ST_MakePoint($10, $11), 4326)::geography,
          $12, $13
        )
        ON CONFLICT (source, source_event_id)
        DO UPDATE SET
          name             = EXCLUDED.name,
          venue            = EXCLUDED.venue,
          address          = EXCLUDED.address,
          city             = EXCLUDED.city,
          state            = EXCLUDED.state,
          event_date       = EXCLUDED.event_date,
          end_date         = EXCLUDED.end_date,
          event_type       = EXCLUDED.event_type,
          registration_url = EXCLUDED.registration_url,
          location         = EXCLUDED.location;
        `,
        [
          event.name,
          event.venue,
          street,
          city,
          state,
          event.start_date,
          event.end_date,
          event.event_type,
          event.registration_url,
          longitude,
          latitude,
          event.source,
          event.source_event_id,
        ]
      );

      if (isNew) {
        console.log(`     ✅ Inserted: ${event.name}`);
        inserted++;
      } else {
        console.log(`     🔄 Updated:  ${event.name}`);
        updated++;
      }

      // Respect Mapbox free-tier rate limit: 600 requests/min
      // Wait 200ms between geocode calls to stay comfortably under limit
      await delay(200);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`     ❌ Failed: ${event.name} — ${msg}`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────────`);
  console.log(`✅ Inserted: ${inserted}`);
  console.log(`🔄 Updated:  ${updated}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`──────────────────────────────────\n`);

  await pool.end();

  if (failed > 0) {
    process.exit(1); // Non-zero exit code fails the GitHub Actions job
  }
}

syncEvents();
