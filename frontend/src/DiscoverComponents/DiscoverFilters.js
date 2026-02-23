import React, { useState } from "react";
import Select from 'react-select';
import CollapsibleFilter from "./CollapsibleFilter";
import RangeSlider from "./RangeSlider";
import CustomMultiSelect from "./CustomMultiSelect";
import RatingFilter from "./RatingFilter";
import PeopleFilter from "./PeopleFilter";
import { GENRE_OPTIONS, LANGUAGE_OPTIONS, STREAMING_OPTIONS, PRICE_OPTIONS, DISCOVER_SORT_BY_OPTIONS} from "./filterOptions";

const DiscoverFilters = ({searchParams, setSearchParams, setFilter, setFilterArray, resetFilters, user }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter(name, value);
};

  const onRangeChange = (name1, name2, value1, value2) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set(name1, value1);
      params.set(name2, value2);
      return params;
    });
  }

  const [open, setOpen] = useState(true);
  const [openFilter, setOpenFilter] = useState(null);

  const handleToggle = (filterName) => {
    setOpenFilter((prev) => (prev === filterName ? null: filterName));
  };

  const getArrayParam = (name) => {
    const value = searchParams.get(name);
    if (!value) return [];
    return value.split(',');
  }

  const handleHideWatchedChange = (e) => {
    if (e.target.checked) {
      setFilter('hide_watched', 'true');
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('hide_watched');
      setSearchParams(newParams);
    }
  }

  const [actorSelectedNames, setActorSelectedNames] = useState([]);
  const [directorSelectedNames, setDirectorSelectedNames] = useState([]);

  return (
    <div className="filters-container">
      <div className="top-filter">
        <label className="title-search">
          Search Movie by Title:
          <input
            type="text"
            name="title"
            value={searchParams.get('title') || ''}
            onChange={handleChange}
            placeholder="Movie Title..."
          />
        </label>
        <button className="filter-reset-button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      <div className="middle-filter">
        <div className="expand-filters">
          <button onClick={() => setOpen(!open)}>
            Filters {open ? "◀" : "▶"}
          </button>
          {open && (
            <div className="collapsible-filters">
              <CollapsibleFilter title="Genres" openFilter={openFilter} onToggle={() => handleToggle("Genres")}>
                <CustomMultiSelect title='Genres' options={GENRE_OPTIONS} selected={getArrayParam('genres')} onChange={(selectedValues) => setFilterArray('genres', selectedValues)}></CustomMultiSelect>
              </CollapsibleFilter>

              <CollapsibleFilter title="Original Language" openFilter={openFilter} onToggle={() => handleToggle("Original Language")}>
                <CustomMultiSelect title='Languages' options={LANGUAGE_OPTIONS} selected={getArrayParam('languages')} onChange={(selectedValues) => setFilterArray('languages', selectedValues)}></CustomMultiSelect>
              </CollapsibleFilter>

              <CollapsibleFilter title="Streaming Services" openFilter={openFilter} onToggle={() => handleToggle("Streaming Services")}>
               <CustomMultiSelect title='Streaming Services' options={STREAMING_OPTIONS} selected={getArrayParam('streaming_services')} onChange={(selectedValues) => setFilterArray('streaming_services', selectedValues)}></CustomMultiSelect>
              </CollapsibleFilter>

              <CollapsibleFilter title="Price" openFilter={openFilter} onToggle={() => handleToggle("Price")}>
                <CustomMultiSelect title='Price' options={PRICE_OPTIONS} selected={getArrayParam('price')} onChange={(selectedValues) => setFilterArray('price', selectedValues)}></CustomMultiSelect>
              </CollapsibleFilter>

              <CollapsibleFilter title="Release Year" openFilter={openFilter} onToggle={() => handleToggle("Release Year")}>
                <RangeSlider min={1900} max={new Date().getFullYear()} min_val={searchParams.get('min_release_year') || '1900'} max_val={searchParams.get('max_release_year') || new Date().getFullYear().toString()} onRangeChange={(min_val, max_val) => onRangeChange('min_release_year', 'max_release_year', min_val, max_val)} title='Release Year'></RangeSlider>
              </CollapsibleFilter>

              <CollapsibleFilter title="Runtime" openFilter={openFilter} onToggle={() => handleToggle('Runtime')}>
                <RangeSlider min={0} max={300} min_val={searchParams.get('min_runtime') || '0'} max_val={searchParams.get('max_runtime') || '300'} onRangeChange={(min_val, max_val) => onRangeChange('min_runtime', 'max_runtime', min_val, max_val)} unitLabel='min' title='Runtime'></RangeSlider>
              </CollapsibleFilter>

              <CollapsibleFilter title="Rating" openFilter={openFilter} onToggle={() => handleToggle("Rating")}>
                <RatingFilter vote_count={searchParams.get('vote_count') || ''} min_rating={searchParams.get('min_rating') || '0'} onVoteCountChange={(selectedValue) => setFilter('vote_count', selectedValue)} onRatingChange={(selectedValue) => setFilter('min_rating', selectedValue)}></RatingFilter>
              </CollapsibleFilter>

              <CollapsibleFilter title='Actors' openFilter={openFilter} onToggle={() => handleToggle("Actors")}>
                <PeopleFilter title='Actors' selected={getArrayParam('actors')} onChange={(selectedValues) => setFilterArray('actors', selectedValues)} selectedNames={actorSelectedNames} setSelectedNames={setActorSelectedNames}></PeopleFilter>
              </CollapsibleFilter>

              <CollapsibleFilter title='Directors' openFilter={openFilter} onToggle={() => handleToggle('Directors')}>
                <PeopleFilter title='Directors' selected={getArrayParam('directors')} onChange={(selectedValues) => setFilterArray('directors', selectedValues)} selectedNames={directorSelectedNames} setSelectedNames={setDirectorSelectedNames}></PeopleFilter>
              </CollapsibleFilter>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-filter">
        <label>
          Sort By:
          <Select
            className="sort-select"
            classNamePrefix='react-select'
            name="sort"
            options={DISCOVER_SORT_BY_OPTIONS}
            value={DISCOVER_SORT_BY_OPTIONS.find((o) => o.value === (searchParams.get('sort') || 'imdb_rating'))}
            onChange={(option) => setFilter('sort', option.value)}
          />
        </label>

        {user && (
          <label>
            <input 
              type="checkbox"
              checked={searchParams.get('hide_watched') === 'true'}
              onChange={handleHideWatchedChange}
            ></input>
            <span>Hide Watched Movies</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default DiscoverFilters;
