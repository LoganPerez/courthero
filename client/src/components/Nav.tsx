import { Link, useLocation } from "react-router-dom";
import "./Nav.css";

function Nav() {
  const { pathname } = useLocation();

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-icon">🏓</span>
        <span className="nav-name">CourtHero</span>
      </Link>

      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${pathname === "/" ? "active" : ""}`}
        >
          Find Events
        </Link>
        <Link
          to="/about"
          className={`nav-link ${pathname === "/about" ? "active" : ""}`}
        >
          About
        </Link>
      </div>
    </nav>
  );
}

export default Nav;
