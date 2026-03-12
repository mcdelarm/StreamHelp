import React from "react";
import { Range, getTrackBackground } from "react-range";

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
      <label className="multi-select-title">{title}</label>

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
                  height: "5px",
                  background: getTrackBackground({
                    values: [Number(min_val), Number(max_val)],
                    colors: ["lab(90 0 0)", "lab(2.75381 0 0)", "lab(90 0 0)"],
                    min,
                    max,
                  }),
                  borderRadius: "4px",
                  marginTop: "8px",
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
                  height: "16px",
                  width: "16px",
                  borderRadius: "50%",
                  backgroundColor: "rgb(255, 255, 255)",
                  border: "1.5px solid lab(7.78201 -0.0000149012 0)",
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
