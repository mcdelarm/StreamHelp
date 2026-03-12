import React, { useState, useRef, useEffect } from "react";

const CustomSingleSelect = ({ options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (value) => {
    setOpen(false);
    if (value !== selected && onChange) {
      onChange(value);
    }
  };

  const label =
    options.find((opt) => opt.value === selected)?.label || options[0]?.label || "";

  return (
    <div className="custom-single-select" ref={ref}>
      <button
        type="button"
        className="single-select-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        {label} <span className="caret">▾</span>
      </button>
      {open && (
        <div className="single-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`single-select-option ${opt.value === selected ? "selected" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
              {opt.value === selected && (
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
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSingleSelect;