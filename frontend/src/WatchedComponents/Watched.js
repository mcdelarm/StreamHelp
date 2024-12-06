import React, {useContext, useState, useEffect} from 'react'
import AuthContext from '../context/AuthContext'
import MovieFeed from '../MovieFeed';

const Watched = () => {
  const {user, authTokens} = useContext(AuthContext)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchedMovies = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await fetch('http://127.0.0.1:8000/api/watched-movies/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ` + String(authTokens.access)
          },
        });
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }

        const data = await response.json();
        setMovies(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false)
      }
    };
    fetchWatchedMovies();
  }, [user, authTokens]);

  if (!user) {
    return (
      <div>
        <p>You are not logged in, redirecting...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <p>Loading your watched movies...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Watched Movies:</h1>
      <MovieFeed movies={movies}/>
    </div>
  )
}

export default Watched