import { useState } from "react";
import "./App.css";

type Event = {
  id: number;
  name: string;
  city: string;
  state: string;
  date: string;
  type: string;
  distance: string;
};

type LocationResult = {
  name: string;
  latitude: number;
  longitude: number;
};

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [location, setLocation] = useState("");
  const [searchedLocation, setSearchedLocation] =
    useState<LocationResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (location.trim() === "") {
      setError("Please enter a city or ZIP code.");
      return;
    }

    setError("");

    try {
      const geocodeResponse = await fetch(
        `http://localhost:3001/api/geocode?location=${encodeURIComponent(location)}`
      );

      if (!geocodeResponse.ok) {
        throw new Error("Location not found");
      }

      const locationData: LocationResult =
        await geocodeResponse.json();

      setSearchedLocation(locationData);

      const eventsResponse = await fetch(
        `http://localhost:3001/api/events` +
        `?latitude=${locationData.latitude}` +
        `&longitude=${locationData.longitude}` +
        `&radius=25`
      );

      if (!eventsResponse.ok) {
        throw new Error("Unable to retrieve events");
      }

      const eventData: Event[] =
        await eventsResponse.json();

      setEvents(eventData);
    } catch (error) {
      console.error(error);
      setError("Unable to search for events.");
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <h1>CourtHero</h1>
        <p>Find pickleball events near you.</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city or ZIP code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button onClick={handleSearch}>
            Find Events
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {searchedLocation && (
          <div className="location-result">
            <p>
              Searching near{" "}
              <strong>{searchedLocation.name}</strong>
            </p>

            <p>
              {searchedLocation.latitude},{" "}
              {searchedLocation.longitude}
            </p>
          </div>
        )}
      </section>

      <section className="events">
        <h2>Upcoming Events</h2>

        <div className="event-grid">
          {events.map((event) => (
            <article
              className="event-card"
              key={event.id}
            >
              <span className="event-type">
                {event.type}
              </span>

              <h3>{event.name}</h3>

              <p>
                {event.city}, {event.state}
              </p>

              <p>{event.date}</p>

              <p>{event.distance} miles away</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
