import React from "react";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "./context/AuthContext";

const Header = () => {
  let { user, logoutUser } = useContext(AuthContext);

  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>StreamHelp</h1>
      </div>

      <nav className="app-nav">
        <Link
          to={"/discover"}
          className={`nav-link ${location.pathname === "/discover" ? "active" : ""}`}
        >
          Discover
        </Link>
        <Link
          to={"/watched"}
          className={`nav-link ${location.pathname === "/watched" ? "active" : ""}`}
        >
          Watched
        </Link>
      </nav>

      <div className="auth-buttons">
        {user ? (
          <button className="logout-button" onClick={logoutUser}>
            Logout
          </button>
        ) : (
          <Link to="/login" state={{ from: location }}>
            <button className="login-button">Login</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
