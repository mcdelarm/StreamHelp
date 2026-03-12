import React from "react";

const CustomMultiSelect = ({ title, options, selected, onChange }) => {
  const handleToggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    onChange(newSelected);
  };
  return (
    <div className="multi-select-container">
      <label className="multi-select-title">{title}</label>
      <div className="multi-select-options-container">
        {options.map(({ value, label }) => {
          const isSelected = selected.includes(value);

          return (
            <div key={value} className="option-container">
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                className={`multi-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleToggle(value)}
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
              <label onClick={() => handleToggle(value)}>{label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomMultiSelect;
