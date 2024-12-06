import React, {useContext, useState, useEffect} from 'react'
import AuthContext from '../context/AuthContext'

const MovieWatched = ({id}) => {
  const {user, authTokens} = useContext(AuthContext);
  const [hasWatched, setHasWatched] = useState(null);
  const [rating, setRating] = useState(null)

  

  useEffect(() => {
    const fetchHasWatchedMovie = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/is-watched-movie/${id}/`, {
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
        setHasWatched(data['isWatched']);
        setRating(data['rating'])
      } catch (error) {
        console.log(error);
      }
    };
    fetchHasWatchedMovie();
  }, [user, id, authTokens]);

  const handleChange = () => {
    const addWatchedMovie = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/add-watched-movie/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ` + String(authTokens.access)
          },
          body: JSON.stringify({
            movie_id: id
          }),
        });
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }
        const data = await response.json();
        setHasWatched(!hasWatched);
      } catch (error) {
        console.log(error);
      }
    }
    addWatchedMovie();
  }

  if (!user) {
    return null;
  }


  if (hasWatched) {
    return (
      <div className='watched-container'>
        <h3>Watched:</h3>
        <p className='watched-message'>You already watched this movie!</p>
      </div>
    )
  }

  return (
    <div className='watched-container'>
      <h3>Watched:</h3>
      <label className='watched-label'>
        Have you watched this movie?
        <input 
          type="checkbox" 
          checked={hasWatched} 
          onChange={handleChange} 
        />
      </label>
    </div>
  )
}

export default MovieWatched