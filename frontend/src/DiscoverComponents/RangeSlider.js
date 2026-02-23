import React from "react";
import { Range } from "react-range";

const RangeSlider = ({
  min,
  max,
  min_val,
  max_val,
  onRangeChange,
  unitLabel,
  title,
}) => {
  return (
    <div className="release-year-filter">
      <div className="multi-select-header">
        <span className="multi-select-title">{title}</span>
        <button
          className="multi-select-reset-btn"
          onClick={() => onRangeChange(String(min), String(max))}
        >
          X Reset
        </button>
      </div>
      <div className="range-wrapper">
        <Range
          step={1}
          min={min}
          max={max}
          values={[Number(min_val), Number(max_val)]}
          onChange={(values) => {
            onRangeChange(String(values[0]), String(values[1]));
          }}
          renderTrack={({ props, children }) => {
            // Remove key before spreading to avoid warning
            const { key, ...rest } = props;

            return (
              <div
                {...rest}
                key="track"
                style={{
                  ...rest.style,
                  height: "6px",
                  background: "#444",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              >
                {children}
              </div>
            );
          }}
          renderThumb={({ props, index }) => {
            const { key, ...rest } = props;

            return (
              <div
                {...rest}
                key={index}
                style={{
                  ...rest.style,
                  height: "20px",
                  width: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  border: "1px solid #888",
                }}
              />
            );
          }}
        />
      </div>

      <div className="release-year-values">
        <span>
          {min_val || min}
          {unitLabel && ` ${unitLabel}`}
        </span>
        <span>
          {max_val || max}
          {unitLabel && ` ${unitLabel}`}
        </span>
      </div>
    </div>
  );
};

export default RangeSlider;
