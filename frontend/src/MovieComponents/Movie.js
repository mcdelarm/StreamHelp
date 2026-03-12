import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import StreamingOptions from "./StreamingOptions";
import MovieWatched from "./MovieWatched";
import { Link } from "react-router-dom";

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const logos = {
    imdb: "/imdb_logo.png",
    tmdb: "/tmdb_logo.png",
    rotten_tomatoes: "/rotten_tomatoes_logo.png",
    metacritic: "/metacritic_logo.png",
  };

  useEffect(() => {
    const fetchMovie = async () => {
      const response = await fetch(`/api/movie/${id}/`);
      const data = await response.json();
      setMovie(data);
    };
    fetchMovie();
  }, [id]);

  const convertToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remaining_minutes = minutes % 60;
    if (hours === 0) return `${remaining_minutes}m`;
    if (remaining_minutes === 0) return `${hours}h`;
    return `${hours}h ${remaining_minutes}m`;
  };

  if (!movie) return <p>Loading...</p>;

  const directorHeading = movie.director.length > 1 ? "Directors" : "Director";

  return (
    <div className="movie-page">
      <div className="movie-metadata-container">
        <div className="movie-page-poster-container">
          <img
            className="movie-page-poster"
            src={movie.poster}
            alt={movie.title}
          ></img>
        </div>
        <div className="movie-information-container">
          <div className="movie-page-header">
            <h1 className="movie-page-title">{movie.title}</h1>
            <div className="movie-page-year-runtime-container">
              <div className="movie-page-release-year">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="calendar-icon"
                >
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className="movie-page-runtime">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="clock-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{convertToHours(Number(movie.runtime))}</span>
              </div>
            </div>
          </div>
          <div className="movie-page-genres">
            {movie.genres.map((genre, index) => (
              <span key={index} className="movie-page-genre-chip">
                {genre}
              </span>
            ))}
          </div>
          {movie.director.length > 0 && (
            <div className="movie-page-director-container">
              <h3>{directorHeading}</h3>
              <div className="director-feed">
                {movie.director.map((director) => (
                  <Link
                    to={`/discover?directors=${director.id}`}
                    className="director-card-link"
                    key={director.id}
                  >
                    <div className="director-container" key={director.id}>
                      <div className="director-picture-container">
                        {director.profile_picture ? (
                          <img
                            className="director-profile-picture"
                            src={director.profile_picture}
                            alt={director.name}
                            onError={(e) =>
                              (e.currentTarget.src = "/default_pfp.jpg")
                            }
                          ></img>
                        ) : (
                          <img
                            src="/default_pfp.jpg"
                            alt="Default Profile"
                            className="director-profile-picture"
                          ></img>
                        )}
                      </div>
                      <div className="director-name">{director.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="movie-page-ratings-container">
            <h3>Ratings</h3>
            <div className="movie-page-ratings-feed">
              {movie.imdb_rating && (
                <div className="movie-page-rating-info">
                  <img
                    src={logos.imdb}
                    alt="IMDb Logo"
                    className="rating-logo"
                  ></img>
                  <span>{movie.imdb_rating}</span>
                </div>
              )}
              {movie.rotten_tomatoes_rating && (
                <div className="movie-page-rating-info">
                  <img
                    src={logos.rotten_tomatoes}
                    alt="Rotten Tomatoes Logo"
                    className="rating-logo"
                  ></img>
                  <span>{movie.rotten_tomatoes_rating}%</span>
                </div>
              )}
              {movie.vote_average && (
                <div className="movie-page-rating-info">
                  <img
                    src={logos.tmdb}
                    alt="TMDB Logo"
                    className="rating-logo"
                  ></img>
                  <span>{movie.vote_average.toFixed(2)}</span>
                </div>
              )}
              {movie.metacritic_rating && (
                <div className="movie-page-rating-info">
                  <img
                    src={logos.metacritic}
                    alt="Metacritic Logo"
                    className="rating-logo"
                  ></img>
                  <span>{movie.metacritic_rating}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="movie-page-personal-rating-container">
            <h3>Your Rating</h3>
            <MovieWatched id={id} />
          </div>
          {movie.trailer_key && (
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailer_key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-link"
            >
              <button className="trailer-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="youtube-icon"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                </svg>
                Watch Trailer
              </button>
            </a>
          )}
        </div>
      </div>

      <div className="movie-page-bottom">
        <div className="movie-page-overview-streaming">
          <div className="movie-page-tabbed-interface">
            <button onClick={() => setActiveTab("overview")} className={`tabbed-interface-btn ${activeTab === "overview" ? "active" : ""}`}>Overview</button>
            <button onClick={() => setActiveTab("streaming")} className={`tabbed-interface-btn ${activeTab === "streaming" ? "active" : ""}`}>Streaming Options</button>
          </div>
          {activeTab === "overview" ? (
            <div className="movie-page-tabbed-results">
              <h2>Overview</h2>
              <p className="movie-page-overview">{movie.overview}</p>
            </div>
          ) : (
            <div className="movie-page-tabbed-results">
              <h2>Streaming Options</h2>
              <StreamingOptions id={id} />
            </div>
          )}
        </div>
        <div className="movie-page-cast-container">
          <h2>Top Cast</h2>
          <div className="movie-page-cast-feed">
            {movie.cast.slice(0, 16).map((actor) => (
              <Link
                to={`/discover?actors=${actor.id}`}
                className="actor-card-link"
                key={actor.id}
              >
                <div className="actor-container" key={actor.id}>
                  {actor.profile_picture ? (
                    <img
                      className="actor-profile-picture"
                      src={actor.profile_picture}
                      alt={actor.name}
                      onError={(e) =>
                        (e.currentTarget.src = "/default_pfp.jpg")
                      }
                    ></img>
                  ) : (
                    <img
                      src="/default_pfp.jpg"
                      alt="Default Profile"
                      className="actor-profile-picture"
                    ></img>
                  )}
                  <div className="actor-name">{actor.name}</div>
                  <div className="character-name">{actor.character}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {movie.similar_movies.length > 0 && (
          <div className="movie-page-similar-movies-container">
            <h2>Similar Movies</h2>
            <div className="movie-page-similar-movie-feed">
              {movie.similar_movies.map((movie) => (
                <div className="similar-movie-card" key={movie.id}>
                  <Link to={`/movie/${movie.id}`} className="similar-movie-link">
                    <img
                      className="similar-movie-poster"
                      src={movie.poster}
                      alt={movie.title}
                    ></img>
                    <div className="similar-movie-title">{movie.title}</div>
                    <div className="similar-movie-year">{new Date(movie.release_date).getFullYear()}</div>
                  </Link>
                  <div className="poster-rating">
                    <span className="poster-rating-star">★</span>
                    {movie.imdb_rating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movie;
