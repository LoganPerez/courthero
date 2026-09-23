import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import "./SubmitEvent.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function SubmitEvent() {
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("Tournament");
  const [registrationUrl, setRegistrationUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{
    id: number;
    name: string;
    city: string;
    state: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !venue || !address || !city || !state || !startDate || !type) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          venue: venue.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          startDate,
          endDate: endDate || null,
          type,
          registrationUrl: registrationUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      setSuccess(true);
      setCreatedEvent(data);
      // Reset form
      setName("");
      setVenue("");
      setAddress("");
      setCity("");
      setState("");
      setStartDate("");
      setEndDate("");
      setRegistrationUrl("");
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create event. Please verify the address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-page">
      <Nav />

      <section className="submit-hero">
        <div className="submit-hero-content">
          <span className="submit-badge">COMMUNITY DIRECTORY</span>
          <h1>Submit an Event</h1>
          <p>
            Organizing a tournament, weekend open play, league, or clinic? Add it
            to CourtHero so local players can find it.
          </p>
        </div>
      </section>

      <section className="submit-form-section">
        <div className="submit-card">
          {success && createdEvent && (
            <div className="success-banner">
              <div className="success-icon">🎉</div>
              <div>
                <h3>Event Published!</h3>
                <p>
                  <strong>{createdEvent.name}</strong> is now live and geocoded
                  in <strong>{createdEvent.city}, {createdEvent.state}</strong>.
                </p>
                <Link to="/" className="btn-success-action">
                  ← Return to Search
                </Link>
              </div>
            </div>
          )}

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="eventName">
                Event Name <span className="req">*</span>
              </label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Gateway City Fall Classic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="venue">
                  Venue Name <span className="req">*</span>
                </label>
                <input
                  id="venue"
                  type="text"
                  placeholder="e.g. Dwight Davis Tennis & Pickleball Center"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="eventType">
                  Event Type <span className="req">*</span>
                </label>
                <select
                  id="eventType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Tournament">Tournament</option>
                  <option value="Open Play">Open Play</option>
                  <option value="League">League</option>
                  <option value="Clinic">Clinic</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Street Address <span className="req">*</span>
              </label>
              <input
                id="address"
                type="text"
                placeholder="e.g. 5620 Grand Dr"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <small className="field-hint">
                Used by Mapbox to pinpoint exact geographic coordinates.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="city">
                  City <span className="req">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. St. Louis"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="state">
                  State <span className="req">*</span>
                </label>
                <input
                  id="state"
                  type="text"
                  placeholder="MO"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="startDate">
                  Start Date <span className="req">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="endDate">End Date (optional)</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regUrl">Registration or Info Link</label>
              <input
                id="regUrl"
                type="url"
                placeholder="https://..."
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Geocoding & Publishing..." : "Publish Event 🏓"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SubmitEvent;
