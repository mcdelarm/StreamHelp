import React from 'react'

const CustomMultiSelect = ({title, options, selected, onChange}) => {
  const handleToggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    
      onChange(newSelected)
  };
  return (
    <div className='multi-select-container'>
      <div className='multi-select-header'>
        <div className='multi-select-title'>{title}</div>
        <button 
          className='multi-select-reset-btn' 
          onClick={() => onChange([])}
        >X Reset</button>
      </div>
      
      <div className='multi-select-options-container'>
        {options.map(({value, label}) => {
          const isSelected = selected.includes(value);

          return (
            <button
              key={value} 
              className={`multi-select-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  )
}

export default CustomMultiSelect