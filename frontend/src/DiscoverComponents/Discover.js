import React from 'react'
import { useState, useEffect} from 'react'
import DiscoverFilters from './DiscoverFilters';
import MovieFeed from '../MovieFeed';
import { useSearchParams } from 'react-router-dom';

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  // const DEFAULT_FILTERS = {
  //   min_release_year: '1900',
  //   max_release_year: new Date().getFullYear().toString(),
  //   sort: 'vote_average',
  //   min_rating: '0',
  //   page: '1'
  // }

  // useEffect(() => {
  //   const params = Object.fromEntries(searchParams.entries());
  //   const newParams = {...DEFAULT_FILTERS, ...params};
  //   setSearchParams(newParams);
  // },[]);



  const resetFilters = () => {
    setSearchParams({});
  }

  const setFilter = (name, value) => {
    console.log('setFilter called:', name, value);
    setSearchParams(prev => {
      console.log('prev params:', prev.toString())
      const params = new URLSearchParams(prev);
      if (value !== '') {
        params.set(name, value);
        console.log('will set ->:', name, value);
      } else {
        params.delete(name);
        console.log('will delete ->', name);
      }

      console.log('new params:', params.toString());
      return params;
    });
  };

  const setFilterArray = (name, value) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (value.length > 0) {
        params.set(name, value.join(','));
      } else {
        params.delete(name);
      }
      return params;
    });
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('sort_direction', 'desc');
        if (!queryParams.get('sort')) {
          queryParams.set('sort', 'vote_average');
        }
        if (!queryParams.get('page')) {
          queryParams.set('page', 1);
        }
        
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
  }, [searchParams]);

  const handlePreviousClick = () => {
    const params = new URLSearchParams(searchParams);
    const newPage = Number(searchParams.get('page'));
    params.set('page', newPage - 1);
    setSearchParams(params);
  }

  const handleNextClick = () => {
    const params = new URLSearchParams(searchParams);
    const newPage = Number(searchParams.get('page'));
    params.set('page', newPage + 1);
    setSearchParams(params);
  }

  return (
    <div className='main-container'>
      <DiscoverFilters searchParams={searchParams} setSearchParams={setSearchParams} setFilter={setFilter} setFilterArray={setFilterArray} resetFilters={resetFilters}/>
      {movies.length ? (
        <MovieFeed movies={movies}/>
      ) : (
        <p className='no-movies-message'>No movies to display. Change the filters to retrieve more movies.</p>
      )}
      <div className='pagination-container'>
        {Number(searchParams.get('page')) > 1 && (
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