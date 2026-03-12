import React, { useState } from "react";
import RangeSlider from "./RangeSlider";
import CustomMultiSelect from "./CustomMultiSelect";
import RatingFilter from "./RatingFilter";
import PeopleFilter from "./PeopleFilter";
import {
  GENRE_OPTIONS,
  LANGUAGE_OPTIONS,
  STREAMING_OPTIONS,
  PRICE_OPTIONS,
} from "./filterOptions";

const DiscoverFilters = ({
  searchParams,
  setSearchParams,
  setFilter,
  setFilterArray,
  resetFilters,
  showFilters,
  onCloseFilters,
}) => {
  const onVoteCountChange = (selectedValue) => {
    const currentVoteCount = searchParams.get("vote_count");
    if (currentVoteCount === selectedValue) {
      // If already selected, remove it
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("vote_count");
      setSearchParams(newParams);
    } else {
      // Otherwise, set it
      setFilter("vote_count", selectedValue);
    }
  };

  const onRangeChange = (name1, name2, value1, value2) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set(name1, value1);
      params.set(name2, value2);
      return params;
    });
  };

  const [openFilter, setOpenFilter] = useState(null);

  const handleToggle = (filterName) => {
    setOpenFilter((prev) => (prev === filterName ? null : filterName));
  };

  const getArrayParam = (name) => {
    const value = searchParams.get(name);
    if (!value) return [];
    return value.split(",");
  };

  const [actorSelectedNames, setActorSelectedNames] = useState([]);
  const [directorSelectedNames, setDirectorSelectedNames] = useState([]);

  return (
    <div className={`filters-container ${showFilters ? 'filters-open' : ''}`}>
      <button className="filters-close-button" onClick={onCloseFilters}>
        ✕
      </button>
      <CustomMultiSelect
        title="Genres"
        options={GENRE_OPTIONS}
        selected={getArrayParam("genres")}
        onChange={(selectedValues) => setFilterArray("genres", selectedValues)}
      ></CustomMultiSelect>

      <CustomMultiSelect
        title="Languages"
        options={LANGUAGE_OPTIONS}
        selected={getArrayParam("languages")}
        onChange={(selectedValues) =>
          setFilterArray("languages", selectedValues)
        }
      ></CustomMultiSelect>

      <CustomMultiSelect
        title="Streaming Services"
        options={STREAMING_OPTIONS}
        selected={getArrayParam("streaming_services")}
        onChange={(selectedValues) =>
          setFilterArray("streaming_services", selectedValues)
        }
      ></CustomMultiSelect>

      <CustomMultiSelect
        title="Price"
        options={PRICE_OPTIONS}
        selected={getArrayParam("price")}
        onChange={(selectedValues) => setFilterArray("price", selectedValues)}
      ></CustomMultiSelect>

      <RangeSlider
        min={1900}
        max={new Date().getFullYear()}
        min_val={searchParams.get("min_release_year") || "1900"}
        max_val={
          searchParams.get("max_release_year") ||
          new Date().getFullYear().toString()
        }
        onRangeChange={(min_val, max_val) =>
          onRangeChange(
            "min_release_year",
            "max_release_year",
            min_val,
            max_val,
          )
        }
        title="Release Year"
      ></RangeSlider>

      <RangeSlider
        min={0}
        max={300}
        min_val={searchParams.get("min_runtime") || "0"}
        max_val={searchParams.get("max_runtime") || "300"}
        onRangeChange={(min_val, max_val) =>
          onRangeChange("min_runtime", "max_runtime", min_val, max_val)
        }
        unitLabel="min"
        title="Runtime"
      ></RangeSlider>

      <RatingFilter
        vote_count={searchParams.get("vote_count") || ""}
        min_rating={searchParams.get("min_rating") || "0"}
        onVoteCountChange={onVoteCountChange}
        onRatingChange={(selectedValue) =>
          setFilter("min_rating", selectedValue)
        }
      ></RatingFilter>

      <PeopleFilter
        title="Actors"
        selected={getArrayParam("actors")}
        onChange={(selectedValues) => setFilterArray("actors", selectedValues)}
        selectedNames={actorSelectedNames}
        setSelectedNames={setActorSelectedNames}
      ></PeopleFilter>

      <PeopleFilter
        title="Directors"
        selected={getArrayParam("directors")}
        onChange={(selectedValues) =>
          setFilterArray("directors", selectedValues)
        }
        selectedNames={directorSelectedNames}
        setSelectedNames={setDirectorSelectedNames}
      ></PeopleFilter>

      <button className="filter-reset-button" onClick={resetFilters}>
        Reset Filters
      </button>
    </div>
  );
};

export default DiscoverFilters;
