import React, {useContext, useState, useEffect} from 'react'
import AuthContext from '../context/AuthContext'

const MovieWatched = ({id}) => {
  const {user, authTokens} = useContext(AuthContext);
  const [hasWatched, setHasWatched] = useState(null);
  const [rating, setRating] = useState(null);

  

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
            movie_id: id,
            watched_date: new Date(),
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

  const handleRatingChange = (event) => {
    const selectedRating = parseInt(event.target.value, 10);
    const updateRating = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/update-watched-movie/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ` + String(authTokens.access)
          },
          body: JSON.stringify({
            rating: selectedRating
          }),
        });
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }
        const data = await response.json();
        setRating(selectedRating);
    } catch (error) {
      console.log(error);
    }
  }
  updateRating();
}


  if (!user) {
    return null;
  }


  if (hasWatched) {
    return (
      <div className='watched-container'>
        <h3>Watched:</h3>
        <p className='watched-message'>You already watched this movie!</p>
        <h3>Rating:</h3>
        <form>
        <div style={{ display: "flex", gap: "10px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={handleRatingChange}
                style={{ display: "none" }}
              />
              <span
                style={{
                  fontSize: "2rem",
                  color: star <= rating ? "#FFD700" : "#E0E0E0",
                }}
              >
                ★
              </span>
            </label>
          ))}
        </div>
        </form>
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