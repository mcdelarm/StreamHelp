import React from "react";
import { useState, useEffect } from "react";
import DiscoverFilters from "./DiscoverFilters";
import MovieFeed from "../MovieFeed";
import { useSearchParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import CustomSingleSelect from "./CustomSingleSelect";
import { DISCOVER_SORT_BY_OPTIONS } from "./filterOptions";

const Discover = () => {
  const { user, authTokens } = React.useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const isHideWatchedSelected = searchParams.get("hide_watched") === "true";

  const resetFilters = () => {
    setSearchParams({});
  };

  const setFilter = (name, value) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value !== "") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", 1);
      return params;
    });
  };

  const setFilterArray = (name, value) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value.length > 0) {
        params.set(name, value.join(","));
      } else {
        params.delete(name);
      }
      params.set("page", 1);
      return params;
    });
  };

  const authHeader = authTokens
    ? { Authorization: `Bearer ${authTokens.access}` }
    : {};

  useEffect(() => {
    if (!user) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("hide_watched");
      setSearchParams(newParams, { replace: true });
    }
  }, [user]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set("sort_direction", "desc");
        if (!queryParams.get("sort")) {
          queryParams.set("sort", "imdb_rating");
        }
        if (!queryParams.get("page")) {
          queryParams.set("page", 1);
        }

        const response = await fetch(
          `/api/movies/?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...authHeader,
            },
          },
        );
        const data = await response.json();
        if (data["next"]) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
        setMovies(data["results"] || []);
        setCount(Number(data["count"]) || 0);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };
    fetchMovies();
  }, [searchParams]);

  const handlePreviousClick = () => {
    const params = new URLSearchParams(searchParams);
    const newPage = Number(searchParams.get("page"));
    params.set("page", newPage - 1);
    setSearchParams(params);
  };

  const handleNextClick = () => {
    const params = new URLSearchParams(searchParams);
    const newPage = Number(searchParams.get("page")) || 1;
    params.set("page", newPage + 1);
    setSearchParams(params);
  };

  const handleHideWatchedChange = () => {
    const isHidden = searchParams.get("hide_watched") === "true";
    if (isHidden) {
      //need to remove hide_watched from searchParams
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("hide_watched");
      setSearchParams(newParams);
    } else {
      //add hide_watched to params
      setFilter("hide_watched", "true");
    }
  };

  return (
    <div className="discovery-container">
      <DiscoverFilters
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        setFilter={setFilter}
        setFilterArray={setFilterArray}
        resetFilters={resetFilters}
        showFilters={showFilters}
        onCloseFilters={() => setShowFilters(false)}
      />
      {showFilters && (
        <div
          className="filters-backdrop"
          onClick={() => setShowFilters(false)}
        />
      )}
      <div className="right-discovery">
        <div className="right-top-discovery">
          <div className="right-top-top">
            <button
              className="filters-toggle-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </button>
            <div className="title-search-container">
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="11" cy="11" r="8"></circle>
              </svg>
              <input
                type="text"
                name="title"
                value={searchParams.get("title") || ""}
                onChange={(e) => setFilter("title", e.target.value)}
                placeholder="Search movies by title..."
                className="title-search-input"
              />
            </div>
          </div>
          <div className="right-top-bottom">
            <div className="sort-by-container">
              <span className="count-span">{count}</span> movies sorted by
              <CustomSingleSelect
                options={DISCOVER_SORT_BY_OPTIONS}
                selected={
                  searchParams.get("sort") || DISCOVER_SORT_BY_OPTIONS[0].value
                }
                onChange={(val) => setFilter("sort", val)}
              ></CustomSingleSelect>
            </div>
            {user && (
              <div className="hide-watched-container">
                <button
                  role="checkbox"
                  aria-checked={isHideWatchedSelected}
                  onClick={handleHideWatchedChange}
                  className={`hide-watched-btn ${isHideWatchedSelected ? "selected" : ""}`}
                >
                  {isHideWatchedSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  )}
                </button>
                <label>Hide watched</label>
              </div>
            )}
          </div>
        </div>
        <div className="right-main-discovery">
          {movies.length ? (
            <MovieFeed movies={movies} />
          ) : (
            <div className="no-movies-message">
              <h3>No movies found</h3>
              <p>Try adjusting your filters to find more movies.</p>
            </div>
          )}
          {movies.length > 0 && (
            <div className="pagination-container">
              {Number(searchParams.get("page")) > 1 ? (
                <button
                  onClick={handlePreviousClick}
                  className="pagination-button-clickable"
                >
                  <span>&lsaquo;</span> Previous
                </button>
              ) : (
                <button className="pagination-button-unclickable">
                  <span>&lsaquo;</span> Previous
                </button>
              )}
              <div className="page-number">
                Page {searchParams.get("page") || 1}
              </div>
              {hasMore ? (
                <button
                  onClick={handleNextClick}
                  className="pagination-button-clickable"
                >
                  Next <span>&rsaquo;</span>
                </button>
              ) : (
                <button className="pagination-button-unclickable">
                  Next <span>&rsaquo;</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
