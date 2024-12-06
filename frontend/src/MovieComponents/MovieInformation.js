import React from 'react'

const MovieInformation = ({movie}) => {
  return (
    <div className='movie-information-container'>
      <h3 className='movie-info-title'>Movie Information</h3>
      <hr />
      <p><strong>Overview:</strong> {movie.overview}</p>
      <p><strong>Release Date:</strong> {movie.release_date}</p>
      {/* add genre and language info if I remember and have time to*/}
      <p><strong>Average Rating:</strong> {movie.vote_average}</p>
      <p><strong>Vote Count:</strong> {movie.vote_count}</p>
      <p><strong>Popularity:</strong> {movie.popularity}</p>
    </div>
  )
}

export default MovieInformation