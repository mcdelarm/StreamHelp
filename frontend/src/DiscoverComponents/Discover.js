import React from 'react'
import { useState, useEffect} from 'react'
import DiscoverFilters from './DiscoverFilters';
import MovieFeed from '../MovieFeed';

const Discover = () => {
  const [filters, setFilters] = useState({
    genres: [],
    min_release_year: '',
    max_release_year: '',
    languages: [],
    sort: 'vote_average',
    vote_count: '',
    title: '',
    streaming_services: [],
    sort_direction: 'desc',
    price: []

  });
  const [movies, setMovies] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleFilterChange = (name, value) => {
    setPageNumber(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.genres.length > 0) {
          queryParams.append('genres', filters.genres.join(','));
        }
        if (filters.languages.length > 0) {
          queryParams.append('languages', filters.languages.join(','));
        }
        if (filters.streaming_services.length > 0) {
          queryParams.append('streaming_services', filters.streaming_services.join(','));
        }
        if (filters.price.length > 0) {
          queryParams.append('price', filters.price.join(','));
        }
        if (filters.min_release_year) {
          queryParams.append('min_release_year', filters.min_release_year);
        }
        if (filters.max_release_year) {
          queryParams.append('max_release_year', filters.max_release_year);
        }
        if (filters.sort) {
          queryParams.append('sort', filters.sort);
        }
        if (filters.vote_count) {
          queryParams.append('vote_count', filters.vote_count);
        }
        if (filters.title) {
          queryParams.append('title', filters.title);
        }
        if (filters.sort_direction) {
          queryParams.append('sort_direction', filters.sort_direction)
        }
        queryParams.append('page', pageNumber);

        const response = await fetch(`http://127.0.0.1:8000/api/movies/?${queryParams.toString()}`);
        const data = await response.json();
        if (data['next']) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
        setMovies(data['results'] || []);

      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };
    fetchMovies();
  }, [filters, pageNumber]);

  const handlePreviousClick = () => {
    setPageNumber(pageNumber - 1);
  }
  
  const handleNextClick = () => {
    setPageNumber(pageNumber + 1);
  }

  return (
    <div className='main-container'>
      <DiscoverFilters filters={filters} setFilters={setFilters} onFilterChange={handleFilterChange}/>
      {movies.length ? (
        <MovieFeed movies={movies}/>
      ) : (
        <p className='no-movies-message'>No movies to display. Change the filters to retrieve more movies.</p>
      )}
      <div className='pagination-container'>
        {pageNumber > 1 && (
          <button onClick={handlePreviousClick} className='pagination-button'>Previous</button>
        )}
        {hasMore && (
          <button onClick={handleNextClick} className='pagination-button'>Next</button>
        )}
      </div>
    </div>
  )
}

export default Discover