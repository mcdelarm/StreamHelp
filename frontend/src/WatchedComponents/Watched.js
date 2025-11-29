import React, { useContext, useState, useEffect, useRef} from "react";
import AuthContext from "../context/AuthContext";
import MovieFeed from "../MovieFeed";
import { SORT_BY_OPTIONS } from "../DiscoverComponents/filterOptions";

const Watched = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedBy, setSortedBy] = useState({label: 'Personal Rating', value: 'rating'});
  const [open, setOpen] = useState(false);
  const dropDownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const fetchWatchedMovies = async () => {
      if (!user) {
        return;
      }
      try {
        const queryParams = new URLSearchParams();
        if (sortedBy) {
          queryParams.append('sort', sortedBy.value)
        }
        const response = await fetch(
          `http://127.0.0.1:8000/api/watched-movies/?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ` + String(authTokens.access),
            },
          }
        );
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }

        const data = await response.json();
        setMovies(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchedMovies();
  }, [user, authTokens, sortedBy]);

  if (!user) {
    return (
      <div>
        <p>You are not logged in, redirecting...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <p>Loading your watched movies...</p>
      </div>
    );
  }

  return (
    <div className="watched-page">
      <div className="watched-page-header">
        <span>Previously Watched Movies sorted by </span>
        <div className="sort-by-dropdown" ref={dropDownRef}>
          <button onClick={() => setOpen(!open)}>{sortedBy.label}</button>
          {open && (
            <div className="sort-by-options">
              {SORT_BY_OPTIONS.map(({ value, label }) => {
                const isSelected = sortedBy.value === value;

                return (
                  <button
                    key={value}
                    className={`sort-by-dropdown-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setSortedBy({label: label, value: value})}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <MovieFeed movies={movies} />
    </div>
  );
};

export default Watched;
