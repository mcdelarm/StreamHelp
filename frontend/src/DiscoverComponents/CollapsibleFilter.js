import React from 'react';
import { useRef, useEffect } from 'react';

const CollapsibleFilter = ({title, openFilter, onToggle, children}) => {
  const ref = useRef();
  const isOpen = openFilter === title;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && ref.current && !ref.current.contains(event.target)) {
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);


  return (
    <div className='collapsible-filter' ref={ref}>
      <button onClick={onToggle}>
        {title} {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div className='collapsible-filter-children'>
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleFilter