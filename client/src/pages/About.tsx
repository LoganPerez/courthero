import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import "./About.css";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "📍",
    title: "Location Search",
    description:
      "Enter any city or ZIP code and instantly discover pickleball events near you, powered by real geocoding.",
  },
  {
    icon: "🔍",
    title: "Radius Filtering",
    description:
      "Narrow or expand your search from 5 to 100 miles. See only what's actually reachable for you.",
  },
  {
    icon: "🏆",
    title: "Event Types",
    description:
      "Browse tournaments and open play sessions in one unified view, sorted by proximity.",
  },
  {
    icon: "🌎",
    title: "True Geographic Distance",
    description:
      "Distances are calculated with PostGIS geographic functions — real miles on a sphere, not approximations.",
  },
];

type TechItem = {
  name: string;
  description: string;
  category: string;
};

const techStack: TechItem[] = [
  { name: "React", description: "UI library", category: "frontend" },
  { name: "TypeScript", description: "Type safety", category: "frontend" },
  { name: "Vite", description: "Build tool", category: "frontend" },
  { name: "Node.js", description: "Runtime", category: "backend" },
  { name: "Express", description: "API server", category: "backend" },
  { name: "PostgreSQL", description: "Database", category: "database" },
  { name: "PostGIS", description: "Geospatial queries", category: "database" },
  { name: "Mapbox", description: "Geocoding API", category: "service" },
  { name: "Vercel", description: "Frontend hosting", category: "infra" },
  { name: "Render", description: "API hosting", category: "infra" },
  { name: "Supabase", description: "Managed database", category: "infra" },
];

const categoryLabel: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  service: "Service",
  infra: "Infrastructure",
};

const steps = [
  {
    number: "01",
    title: "Enter a location",
    description:
      "Type any city name or ZIP code into the search bar and choose how far you're willing to travel.",
  },
  {
    number: "02",
    title: "Geocode & query",
    description:
      "The Mapbox Geocoding API converts your input into coordinates. The server then runs a PostGIS ST_DWithin query to find all events within your radius.",
  },
  {
    number: "03",
    title: "See results by distance",
    description:
      "Events are returned sorted by ST_Distance — the closest ones first — displayed as clean cards with type, city, and date.",
  },
];

function About() {
  return (
    <div className="about-page">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="about-hero">
        <Nav />

        <div className="about-hero-content">
          <div className="about-badge">OPEN SOURCE PROJECT</div>

          <h1 className="about-title">
            Find Your Next<br />
            <span className="about-title-accent">Pickleball Event</span>
          </h1>

          <p className="about-subtitle">
            CourtHero is a full‑stack web app that lets any pickleball player
            discover nearby tournaments and open‑play sessions by entering their
            location. Built with real geospatial tech — not just zip code lookups.
          </p>

          <div className="about-hero-actions">
            <Link to="/" className="btn-primary">
              Find Events Near Me
            </Link>
            <a
              href="https://github.com/LoganPerez/courthero"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner">
          <p className="section-eyebrow">FEATURES</p>
          <h2 className="section-heading">Built for players, by a player</h2>

          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner">
          <p className="section-eyebrow">HOW IT WORKS</p>
          <h2 className="section-heading">From search to results in seconds</h2>

          <div className="steps-list">
            {steps.map((step) => (
              <div className="step" key={step.number}>
                <div className="step-number">{step.number}</div>
                <div className="step-body">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner">
          <p className="section-eyebrow">TECH STACK</p>
          <h2 className="section-heading">What it's built with</h2>

          <div className="tech-grid">
            {techStack.map((item) => (
              <div className={`tech-card tech-card--${item.category}`} key={item.name}>
                <span className="tech-name">{item.name}</span>
                <span className="tech-desc">{item.description}</span>
                <span className="tech-category">{categoryLabel[item.category]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <span className="cta-icon">🏓</span>
          <h2>Ready to find a game?</h2>
          <p>Search for pickleball events near your location — free, no account needed.</p>
          <Link to="/" className="btn-primary btn-primary--large">
            Open CourtHero
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="about-footer">
        <p>
          Built by{" "}
          <a
            href="https://github.com/LoganPerez"
            target="_blank"
            rel="noreferrer"
          >
            Logan Perez
          </a>{" "}
          · Computer Science, Washington University in St. Louis
        </p>
        <p className="footer-stack">
          React · TypeScript · Node.js · PostgreSQL · PostGIS · Mapbox
        </p>
      </footer>
    </div>
  );
}

export default About;
