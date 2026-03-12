import React from "react";
import { Range, getTrackBackground } from "react-range";
import { VOTE_COUNT_OPTIONS } from "./filterOptions";

const RatingFilter = ({
  vote_count,
  min_rating,
  onVoteCountChange,
  onRatingChange,
}) => {
  return (
    <div className="rating-filter-container">
      <label className="multi-select-title">Minimum Rating</label>
      <div className="rating-range-container">
        <Range
          step={0.1}
          min={0}
          max={10}
          values={[Number(min_rating)]}
          onChange={(values) => onRatingChange(String(values[0]))}
          renderTrack={({ props: trackProps, children }) => {
            const { key, ...rest } = trackProps;
            return (
              <div
                key={key}
                {...rest}
                style={{
                  ...rest.style,
                  height: "5px",
                  background: getTrackBackground({
                    values: [Number(min_rating)],
                    colors: ["lab(2.75381 0 0)", "lab(90 0 0)"],
                    min: 0,
                    max: 10,
                  }),
                  borderRadius: "4px",
                  marginTop: "8px",
                }}
              >
                {children}
              </div>
            );
          }}
          renderThumb={({ props: thumbProps }) => {
            const { key, ...rest } = thumbProps;

            return (
              <div
                key={key}
                {...rest}
                style={{
                  ...rest.style,
                  height: "16px",
                  width: "16px",
                  borderRadius: "50%",
                  backgroundColor: "rgb(255, 255, 255)",
                  border: "1.5px solid lab(7.78201 -0.0000149012 0)",
                }}
              ></div>
            );
          }}
        />

        <div className="min-rating-values">
          <span>⭐ {Number(min_rating).toFixed(1)} and up</span>
        </div>
      </div>

      <label className="vote-count-label">Minimum Vote Count</label>
      <div className="multi-select-options-container">
        {VOTE_COUNT_OPTIONS.map(({ value, label }) => {
          const isSelected = vote_count === value;

          return (
            <div key={value} className="option-container">
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                className={`multi-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => onVoteCountChange(value)}
              >
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="checkmark-svg"
                    style={{ pointerEvents: "none" }}
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                )}
              </button>
              <label onClick={() => onVoteCountChange(value)}>{label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingFilter;
