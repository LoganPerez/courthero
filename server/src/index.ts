import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CourtHero API is running");
});

app.get("/api/events", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Forest Park Open Play",
      city: "St. Louis",
      state: "MO",
      date: "2026-09-26",
      type: "Open Play",
    },
    {
      id: 2,
      name: "Gateway Pickleball Classic",
      city: "St. Louis",
      state: "MO",
      date: "2026-10-03",
      type: "Tournament",
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`CourtHero API running at http://localhost:${PORT}`);
});
