import React from 'react'
import { Link } from 'react-router-dom'

const MovieCard = ({movie}) => {
  return (
    <div className='movie-card'>
      <Link to={`/movie/${movie.id}`} className='movie-link'>
      <img className='movie-poster' src={movie.poster} alt='Movie Poster'/>
      <p className='movie-title'>{movie.title}</p>
      </Link>
    </div>
  )
}

export default MovieCard