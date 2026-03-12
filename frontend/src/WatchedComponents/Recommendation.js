import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import MovieFeed from "../MovieFeed";
import { Link } from "react-router-dom";

const Recommendation = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await fetch("/api/recommended-movies/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ` + String(authTokens.access),
          },
        });
        if (!response.ok) {
          console.log("Error fetching recommended movies");
        }
        const data = await response.json();
        //If user has no rated movies data will be top rated movies
        setRecommendedMovies(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRecommendedMovies();
  }, [user, authTokens]);
  return (
    <section className="recommended-movies-container">
      <div className="watched-page-header">
        <h1>Recommended Movies</h1>
      </div>
      <div className="recommended-movies-bottom">
        {recommendedMovies.length > 0 ? (
          <div className="watched-movies-feed">
            {recommendedMovies.map((movie) => (
              <div key={movie.id} className="watched-movie-card">
                <Link to={`/movie/${movie.id}`} className="watched-movie-link">
                  <div className="watched-movie-poster-container">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="watched-movie-poster"
                    />
                  </div>
                  <div className="watched-movie-title">{movie.title}</div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-watched-error-message">
            <h3>No recommendations available</h3>
            <p>Rate movies to get personalized recommendations!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommendation;
