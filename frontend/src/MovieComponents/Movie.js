import React from 'react'
import { useParams } from 'react-router-dom'
import {useState, useEffect} from 'react'
import StreamingOptions from './StreamingOptions';
import MovieInformation from './MovieInformation';
import MovieWatched from './MovieWatched';

const Movie = () => {

  const {id} = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      const response = await fetch(`http://127.0.0.1:8000/api/movie/${id}/`);
      const data = await response.json();
      setMovie(data);
    };
    fetchMovie();
  }, [id])

  if (!movie) return <p>Loading...</p>;

  return (
    <div className='big-movie-page'>
      <p className='big-movie-title'>{movie.title}</p>
      <img className='big-movie-poster' src={movie.poster} alt={movie.title}></img>
      <MovieInformation movie={movie}/>
      <StreamingOptions id={id}/>
      <MovieWatched id={id}/>
    </div>
  )
}

export default Movie