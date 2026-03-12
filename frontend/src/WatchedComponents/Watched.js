import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import Recommendation from "./Recommendation";
import { SORT_BY_OPTIONS } from "../DiscoverComponents/filterOptions";
import { useSearchParams, Link } from "react-router-dom";
import CustomSingleSelect from "../DiscoverComponents/CustomSingleSelect";

const Watched = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchWatchedMovies = async () => {
      if (!user) {
        return;
      }
      try {
        const queryParams = new URLSearchParams(searchParams);
        if (!queryParams.get("sort")) {
          queryParams.set("sort", "-rating");
        }
        if (!queryParams.get("page")) {
          queryParams.set("page", 1);
        }
        const response = await fetch(
          `/api/watched-movies/?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ` + String(authTokens.access),
            },
          },
        );
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }
        const data = await response.json();
        setCount(Number(data["count"]));
        setMovies(data["results"] || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchedMovies();
  }, [user, authTokens, searchParams]);

  const setSort = (value) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("sort", value);
      return params;
    });
  };

  if (!user) {
    return (
      <div>
        <p>You are not logged in, redirecting...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-watched-msg">
        <p>Loading your watched movies...</p>
      </div>
    );
  }

  return (
    <div className="watched-page">
      <section className="watched-movies-container">
        <div className="watched-page-header">
          <h1 className="watched-title">Watched Movies</h1>
          <div className="sort-by-container">
            <span className="count-span">{count}</span> movies sorted by
            <CustomSingleSelect
              options={SORT_BY_OPTIONS}
              selected={searchParams.get("sort") || "-rating"}
              onChange={setSort}
            />
          </div>
        </div>
        <div className="watched-movies-bottom">
          {count > 0 ? (
            <div className="watched-movie-feed">
              {movies.map((movie) => (
                <div className="watched-movie-card" key={movie.id}>
                  <Link to={`/movie/${movie.id}`} className="watched-movie-link">
                    <div className="watched-movie-poster-container">
                      <img
                        className="watched-movie-poster"
                        src={movie.poster}
                        alt={movie.title}
                      />
                    </div>
                    <div className="watched-movie-title">{movie.title}</div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-watched-error-message">
              <h3>No movies found</h3>
              <p>
                Rate movies to store watched movies and get more personalized
                recommendations!
              </p>
            </div>
          )}
        </div>
      </section>
      <Recommendation />
    </div>
  );
};

export default Watched;
