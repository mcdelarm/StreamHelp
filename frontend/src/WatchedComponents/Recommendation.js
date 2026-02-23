import React, {useContext, useEffect, useState} from 'react'
import AuthContext from '../context/AuthContext';
import MovieFeed from '../MovieFeed';

const Recommendation = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await fetch('http://127.0.0.1:8000/api/recommended-movies/',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ` + String(authTokens.access)
            }
          }
        );
        if (!response.ok) {
          console.log('Error fetching recommended movies');
        }
        const data = await response.json();
        //If user has no rated movies data will be top rated movies
        setRecommendedMovies(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRecommendedMovies();
  }, [user, authTokens]);
  return (
    <div className='recommended-movies-container'>
      {recommendedMovies.length > 0 ? (
        <>
         <p className='recommended-movies-header'>Recommended Movies</p>
          <MovieFeed movies={recommendedMovies}/>
        </>
      ) : (
        <p className='recommended-error-message'>Rate some movies to get recommended movies!</p>
      )}
    </div>
  )
}

export default Recommendation