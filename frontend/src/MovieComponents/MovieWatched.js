import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import ReactStars from 'react-rating-stars-component';
import { useNavigate, useLocation} from "react-router-dom";

const MovieWatched = ({ id }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authTokens } = useContext(AuthContext);
  const [rating, setRating] = useState(null);

  //First fetch information regarding if user has watched movie and the current rating
  useEffect(() => {
    const fetchHasWatchedMovie = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await fetch(
          `/api/get-movie-rating/${id}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ` + String(authTokens.access),
            },
          }
        );
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }
        const data = await response.json();
        setRating(data.rating !== null ? parseFloat(data.rating) : null);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHasWatchedMovie();
  }, [user, id, authTokens]);

  const handleRatingChange = (newRating) => {
    if (!user) {
      navigate('/login', {state: {from: location}});
      return;
    }
    const updateRating = async () => {
      try {
        const response = await fetch(
          `/api/set-movie-rating/${id}/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ` + String(authTokens.access),
            },
            body: JSON.stringify({
              rating: newRating,
            }),
          }
        );
        if (!response.ok) {
          console.log("Error fetching watched movies");
          return;
        }
        setRating(newRating);
      } catch (error) {
        console.log(error);
      }
    };
    updateRating();
  };

  return (
    <div className="rating-container">
      <ReactStars
        key={`stars_${rating}`}
        count={5}
        value={rating ?? 0}
        isHalf={true}
        onChange={handleRatingChange}
        size={24}
      />
    </div>
  )
};

export default MovieWatched;
