import { useState } from "react";
import Nav from "../components/Nav";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type Event = {
  id: number;
  name: string;
  venue?: string;
  city: string;
  state: string;
  date: string;
  end_date?: string;
  type: string;
  registration_url?: string;
  distance: string;
};

type LocationResult = {
  name: string;
  latitude: number;
  longitude: number;
};

function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(25);

  const [searchedLocation, setSearchedLocation] =
    useState<LocationResult | null>(null);

  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (location.trim() === "") {
      setError("Please enter a city or ZIP code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const geocodeResponse = await fetch(
        `${API_URL}/api/geocode?location=${encodeURIComponent(location)}`
      );

      if (!geocodeResponse.ok) {
        throw new Error("Location not found");
      }

      const locationData: LocationResult =
        await geocodeResponse.json();

      setSearchedLocation(locationData);

      const eventsResponse = await fetch(
        `${API_URL}/api/events` +
          `?latitude=${locationData.latitude}` +
          `&longitude=${locationData.longitude}` +
          `&radius=${radius}`
      );

      if (!eventsResponse.ok) {
        throw new Error("Unable to retrieve events");
      }

      const eventData: Event[] = await eventsResponse.json();

      setEvents(eventData);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      setError("Unable to search for events.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <main className="page">
      <Nav />

      <section className="hero">
        <div className="hero-content">
          <div className="brand">
            <span className="brand-icon">🏓</span>
            <h1>CourtHero</h1>
          </div>

          <p className="tagline">
            Find pickleball tournaments, open play, and events near you.
          </p>

          <div className="search-container">
            <input
              type="text"
              placeholder="Enter city or ZIP code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
            </select>

            <button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Find Events"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}

          {searchedLocation && hasSearched && (
            <p className="search-result">
              Showing events within <strong>{radius} miles</strong> of{" "}
              <strong>{searchedLocation.name}</strong>
            </p>
          )}
        </div>
      </section>

      <section className="events-section">
        <div className="events-header">
          <div>
            <p className="section-label">DISCOVER</p>
            <h2>Upcoming Events</h2>
          </div>

          {hasSearched && (
            <span className="event-count">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>

        {!hasSearched && (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>Find something nearby</h3>
            <p>
              Enter a city or ZIP code above to discover pickleball events in
              your area.
            </p>
          </div>
        )}

        {hasSearched && events.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏓</div>
            <h3>No events found</h3>
            <p>
              Try increasing your search radius or searching another location.
            </p>
          </div>
        )}

        <div className="event-grid">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <div className="card-top">
                <span className="event-type">{event.type}</span>

                <span className="distance">
                  {event.distance} mi
                </span>
              </div>

              <h3>{event.name}</h3>

              <div className="event-details">
                {event.venue && <p className="event-venue">🏟️ {event.venue}</p>}
                <p>📍 {event.city}, {event.state}</p>
                <p>
                  📅 {formatDate(event.date)}
                  {event.end_date ? ` – ${formatDate(event.end_date)}` : ""}
                </p>
              </div>

              {event.registration_url && (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-link-btn"
                >
                  Event Info & Registration ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
