import React from "react";
import { Range } from "react-range";
import { VOTE_COUNT_OPTIONS } from "./filterOptions";

const RatingFilter = ({
  vote_count,
  min_rating,
  onVoteCountChange,
  onRatingChange,
}) => {
  return (
    <div className="rating-filter-container">
      <div className="rating-filter-header">
        <span className="rating-filter-title">Rating</span>
        <button
          className="rating-filter-reset-btn"
          onClick={() => onRatingChange("0")}
        >
          X Reset
        </button>
      </div>

      <div className="rating-range-container">
        <Range
          step={1}
          min={0}
          max={10}
          values={[Number(min_rating)]}
          onChange={(values) => onRatingChange(String(values[0]))}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: "6px",
                background: "#444",
                borderRadius: "4px",
                marginTop: "10px",
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: "20px",
                width: "20px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                border: "1px solid #888",
              }}
            ></div>
          )}
        />

        <div className="min-rating-values">
          <span>{min_rating}</span>
          <span>10</span>
        </div>
      </div>

      <div className="rating-filter-header">
        <span className="rating-filter-title">Vote Count</span>
        <button
          className="rating-filter-reset-btn"
          onClick={() => onVoteCountChange("")}
        >
          X Reset
        </button>
      </div>

      <div className="vote-count-options-container">
        {VOTE_COUNT_OPTIONS.map(({ value, label }) => {
          const isSelected = vote_count === value;

          return (
            <button
              key={value}
              type="button"
              className={`vote-count-option ${isSelected ? "selected" : ""}`}
              onClick={() => onVoteCountChange(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatingFilter;
