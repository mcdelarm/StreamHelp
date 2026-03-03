import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import StreamingOptions from "./StreamingOptions";
import MovieCard from "../MovieCard";
import MovieWatched from "./MovieWatched";
import { Link } from "react-router-dom";

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

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

  return (
    <div className="movie-page">
      <h1 className="movie-page-title">{movie.title}</h1>
      <p className="movie-page-year">
        {new Date(movie.release_date).getFullYear()} &middot;{" "}
        {convertToHours(Number(movie.runtime))}
      </p>
      <div className="movie-page-media">
        <img
          className="movie-page-poster"
          src={movie.poster}
          alt={movie.title}
        ></img>
        <iframe
          className="movie-page-trailer"
          src={`https://www.youtube.com/embed/${movie.trailer_key}`}
          title="Movie Trailer"
        ></iframe>
      </div>
      <div className="movie-page-info">
        <div className="movie-page-info-left">
          <div className="genres-personal-rating-container">
            <div className="movie-page-genres-container">
              <h3>Genres</h3>
              {movie.genres.map((genre, index) => (
                <span key={index} className="movie-page-genre">
                  {genre}
                </span>
              ))}
            </div>
            <MovieWatched id={id} />
          </div>

          <h3>Overview</h3>
          <p className="movie-page-overview">{movie.overview}</p>
          <div className="ratings-container">
            <div className="movie-page-ratings">
              <h3>Ratings</h3>
              {movie.imdb_rating && (
                <p className="movie-page-rating-info">
                  IMDb: {movie.imdb_rating} &middot;{" "}
                  {movie.imdb_votes.toLocaleString()} votes
                </p>
              )}
              {movie.rotten_tomatoes_rating && (
                <p className="movie-page-rating-info">
                  Rotten Tomatoes: {movie.rotten_tomatoes_rating}%
                </p>
              )}
              {movie.metacritic_rating && (
                <p className="movie-page-rating-info">
                  Metacritic: {movie.metacritic_rating}
                </p>
              )}
              <p className="movie-page-rating-info">
                TMDB: {movie.vote_average.toFixed(2)} &middot;{" "}
                {movie.vote_count.toLocaleString()} votes
              </p>
            </div>
            <div className="director-container">
            {movie.director.length > 0 && (
              <>
                <h3>Director</h3>
                <div className="director-grid">
                  {movie.director.map((director) => (
                    <Link
                      to={`/discover?directors=${director.id}`}
                      className="director-card-link"
                      key={director.id}
                    >
                      <div className="director-card">
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
                        <div className="director-name">{director.name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
          </div>
          {movie.similar_movies.length > 0 && (
            <div className="similar-movies-container">
              <h3>Similar Movies</h3>
              <div className="similar-movies-grid">
                {movie.similar_movies.map((movie) => (
                  <MovieCard movie={movie} key={movie.id} />
                ))}
              </div>

            </div>
          )}
        </div>

        <div className="movie-page-info-right">
          <StreamingOptions id={id} />
          <div className="cast-container">
            {movie.cast.length > 0 && (
              <>
                <h3>Top Cast</h3>
                <div className="cast-grid">
                  {movie.cast.slice(0, 8).map((actor) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movie;
