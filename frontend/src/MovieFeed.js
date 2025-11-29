import React, {useState} from 'react'
import MovieCard from './MovieCard'

const MovieFeed = ({movies}) => {
  const [selected, setSelected] = useState([]);
  return (
    <div className='movies-container'>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieFeed