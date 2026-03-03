import React, { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/AuthContext";
import MovieFeed from "../MovieFeed";
import Recommendation from "./Recommendation";
import { SORT_BY_OPTIONS } from "../DiscoverComponents/filterOptions";
import { useSearchParams } from "react-router-dom";

const Watched = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropDownRef = useRef(null);

  const SORT_BY_HASH = SORT_BY_OPTIONS.reduce((acc, { label, value }) => {
  acc[value] = label;
  return acc;
}, {});


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const fetchWatchedMovies = async () => {
      if (!user) {
        return;
      }
      try {
        const queryParams = new URLSearchParams(searchParams);
        if (!queryParams.get('sort')) {
          queryParams.set('sort', '-rating');
        }
        if (!queryParams.get('page')) {
          queryParams.set('page', 1);
        }
        const response = await fetch(
          `/api/watched-movies/?${queryParams.toString()}`,
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
        if (data['next']) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
        setCount(Number(data['count']))
        setMovies(data['results'] || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchedMovies();
  }, [user, authTokens, searchParams]);

  const handlePreviousClick = () => {
    const params = new URLSearchParams(searchParams);
    const newPage = Number(searchParams.get('page'));
    params.set('page', newPage - 1);
    setSearchParams(params);
  }

  const handleNextClick = () => {
    const params = new URLSearchParams(searchParams);
    const newPage = Number(searchParams.get('page')) || 1;
    params.set('page', newPage + 1);
    setSearchParams(params);
  }

  const setSort = (value) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('sort', value);
      return params;
    })
  }

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
      <div className="watched-movies-container">
      <div className="watched-page-header">
        <span>Previously Watched Movies sorted by </span>
        <div className="sort-by-dropdown" ref={dropDownRef}>
          <button onClick={() => setOpen(!open)}>{SORT_BY_HASH[searchParams.get('sort') || '-rating']} ▼</button>
          {open && (
            <div className="sort-by-options">
              {SORT_BY_OPTIONS.map(({ value, label }) => {
                const isSelected = !searchParams.get('sort') && value === '-rating'
                  ? true
                  : searchParams.get('sort') === value;

                return (
                  <button
                    key={value}
                    className={`sort-by-dropdown-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setSort(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {count > 0 ? (
        <MovieFeed movies={movies}/>
      ) : (
        <div className="empty-watched-error-message">Rate movies to store watched movies and get more personalized recommendations!</div>
      )}
      <div className="pagination-container">
        {Number(searchParams.get('page')) > 1 && (
          <button onClick={handlePreviousClick} className="pagination-button">Previous</button>
        )}
        {hasMore && (
          <button onClick={handleNextClick} className="pagination-button">Next</button>
        )}
      </div>
      </div>
      <Recommendation/>
    </div>
  );
};

export default Watched;
