import { useEffect, useState } from "react";
import "./App.css";

type Event = {
  id: number;
  name: string;
  city: string;
  state: string;
  date: string;
  type: string;
};

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/events")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleSearch = () => {
    console.log("Searching near:", location);
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

          <button onClick={handleSearch}>Find Events</button>
        </div>
      </section>

      <section className="events">
        <h2>Upcoming Events</h2>

        <div className="event-grid">
          {events.map((event) => (
            <article className="event-card" key={event.id}>
              <span className="event-type">{event.type}</span>

              <h3>{event.name}</h3>

              <p>
                {event.city}, {event.state}
              </p>

              <p>{event.date}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
