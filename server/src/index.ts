import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pool from "./db.js";

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CourtHero API is running");
});

app.get("/api/events", async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const radius = Number(req.query.radius ?? 25);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    Number.isNaN(radius)
  ) {
    return res.status(400).json({
      error: "Valid latitude, longitude, and radius are required",
    });
  }

  try {
    const radiusMeters = radius * 1609.34;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        city,
        state,
        event_date AS date,
        event_type AS type,
        ROUND(
          (
            ST_Distance(
              location,
              ST_SetSRID(
                ST_MakePoint($1, $2),
                4326
              )::geography
            ) / 1609.34
          )::numeric,
          1
        ) AS distance
      FROM events
      WHERE ST_DWithin(
        location,
        ST_SetSRID(
          ST_MakePoint($1, $2),
          4326
        )::geography,
        $3
      )
      ORDER BY distance;
      `,
      [longitude, latitude, radiusMeters]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve events",
    });
  }
});

app.get("/api/geocode", async (req, res) => {
  const location = req.query.location;

  if (typeof location !== "string" || location.trim() === "") {
    return res.status(400).json({
      error: "Location is required",
    });
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "Mapbox access token is not configured",
    });
  }

  try {
    const url =
      `https://api.mapbox.com/search/geocode/v6/forward` +
      `?q=${encodeURIComponent(location)}` +
      `&access_token=${token}` +
      `&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Mapbox request failed");
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({
        error: "Location not found",
      });
    }

    const result = data.features[0];
    const [longitude, latitude] = result.geometry.coordinates;

    res.json({
      name: result.properties?.full_address ?? result.properties?.name,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to geocode location",
    });
  }
});

app.listen(PORT, () => {
  console.log(`CourtHero API running at http://localhost:${PORT}`);
});
