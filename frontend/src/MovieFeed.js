import React from 'react'
import MovieCard from './MovieCard'

const MovieFeed = ({movies, className = 'movies-container'}) => {
  return (
    <div className={className}>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieFeed