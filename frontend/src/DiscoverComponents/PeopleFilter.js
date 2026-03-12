import React, { useEffect, useRef, useState } from "react";

const PeopleFilter = ({
  title,
  selected,
  onChange,
  selectedNames,
  setSelectedNames,
}) => {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && ref.current && !ref.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);


  const handleToggle = (id, name) => {
    const newSelected = selected.includes(id)
      ? selected.filter((v) => v !== id)
      : [...selected, id];

    onChange(newSelected);

    const exists = selectedNames.some((obj) => obj.id === id);
    console.log(exists);
    const newSelectedNames = exists
      ? selectedNames.filter((v) => v.id !== id)
      : [...selectedNames, { id: id, name: name }];
    setSelectedNames(newSelectedNames);
  };

  const handleChipClick = (id) => {
    const newSelectedNames = selectedNames.filter((person) => person.id !== id);
    setSelectedNames(newSelectedNames);

    const newSelected = selected.filter((person_id) => person_id !== id);
    onChange(newSelected);
  };

  useEffect(() => {
    //API call to get actors based on name
    const fetchPeople = async () => {
      let api_url = "";
      if (title === "Actors") {
        api_url = `/api/actors/?name=${name}`;
      } else {
        api_url = `/api/directors/?name=${name}`;
      }
      try {
        const response = await fetch(api_url);
        const data = await response.json();
        setPeople(data || []);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };
    fetchPeople();
  }, [title, name]);

  return (
    <div className="multi-select-container">
        <label className="multi-select-title">{title}</label>

      <div className="people-filter-container">
        {dropdownOpen && (
          <div className="people-filter-dropdown-container" ref={ref}>
            <div className="people-search-container">
              <svg
                className='people-search-icon'
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                strokeLinejoin='round'
                strokeLinecap='round'
              >
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="11" cy="11" r="8"></circle>
              </svg>
              <input
                type="text"
                placeholder={`Search or add ${title.toLowerCase()}...`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="people-filter-input"
              ></input>
            </div>
            <div className="people-options-container">
              {people.length > 0 ? (
                <div className="people-options-grid">
                  {people.map(({ id, name }) => {
                    const isSelected = selected.includes(String(id));
                    
                    return (
                      <button
                        key={id}
                        className={`people-filter-option ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleToggle(String(id), String(name))}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-people-options">No {title.toLowerCase()} found.</div>
              )}
            </div>
          </div>
        )}
        <button className="search-people-button" ref={buttonRef} onClick={() => setDropdownOpen(!dropdownOpen)}>Search {title.toLowerCase()}...</button>
        {selectedNames.length > 0 && (
          <div className="chips-container">
            {selectedNames.map(({ id, name }) => {
              return (
                <div className="chip" key={id}>
                  <span className="chip-label">{name}</span>
                  <button
                    className="chip-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChipClick(String(id));
                    }}
                  >
                    x
                  </button>
                </div>
              );
            })}
            </div>
        )}
        {/* <div className="people-filter-search-container">
          {selectedNames.length > 0 && (
            <div className="chips-container">
              {selectedNames.map(({ id, name }) => {
                return (
                  <div className="chip" key={id}>
                    <span className="chip-label">{name}</span>
                    <button
                      className="chip-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChipClick(String(id));
                      }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <input
            className="people-filter-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search for Actors..."
          ></input>
        </div>

        {people.length > 0 && (
          <div className="people-filter-dropdown-container">
            {people.map(({ id, name }) => {
              const isSelected = selected.includes(String(id));

              return (
                <button
                  key={id}
                  className={`multi-select-option ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleToggle(String(id), String(name))}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PeopleFilter;
