import React, { useEffect, useState } from "react";

const PeopleFilter = ({
  title,
  selected,
  onChange,
  selectedNames,
  setSelectedNames,
}) => {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");

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
        api_url = `http://127.0.0.1:8000/api/actors/?name=${name}`;
      } else {
        api_url = `http://127.0.0.1:8000/api/directors/?name=${name}`;
      }
      try {
        const response = await fetch(api_url);
        const data = await response.json();
        setPeople(data || []);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };
    if (name) {
      fetchPeople();
    } else {
      setPeople([]);
    }
  }, [title, name]);

  return (
    <div className="multi-select-container">
      <div className="multi-select-header">
        <span className="multi-select-title">{title}</span>
        <button
          className="multi-select-reset-btn"
          onClick={() => {
            onChange([]);
            setName([]);
            setSelectedNames([]);
          }}
        >
          X Reset
        </button>
      </div>

      <div className="people-filter-container">
        <div className="people-filter-search-container">
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
        )}
      </div>
    </div>
  );
};

export default PeopleFilter;
