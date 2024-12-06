import React from 'react'
import MovieCard from './MovieCard'

const MovieFeed = ({movies}) => {
  return (
    <div className='movies-container'>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieFeed