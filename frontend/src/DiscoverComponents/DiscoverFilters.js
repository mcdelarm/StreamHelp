import React from 'react'

const DiscoverFilters = ({filters, setFilters, onFilterChange}) => {
  
  const handleChange = (e) => {
    const {name, value} = e.target;
    if (name === 'genres' || name === 'streaming_services' || name === 'languages' || name === 'price') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      onFilterChange(name, selectedOptions);
    } else {
      onFilterChange(name, value);
    }
  };

  const handleReset = () => {
    setFilters({
      genres: [],
      min_release_year: '',
      max_release_year: '',
      languages: [],
      sort: 'vote_average',
      vote_count: '',
      title: '',
      streaming_services: [],
      sort_direction: 'desc',
      price: []
    });
  }
  return (
        <div className='filters-container'>
          <div className='filter'>
          <label>
          Genre:
          <select name="genres" value={filters.genres} onChange={handleChange} multiple>
            <option value={'action'}>Action</option>
            <option value={'comedy'}>Comedy</option>
            <option value={'thriller'}>Thriller</option>
            <option value={'documentary'}>Documentary</option>
            <option value={'horror'}>Horror</option>
          </select>
        </label>
          </div>
        
        <div className='filter'>
        <label>
          Original Language:
          <select name="languages" value={filters.languages} onChange={handleChange} multiple>
            <option value={'en'}>English</option>
            <option value={'fr'}>French</option>
            <option value={'es'}>Spanish</option>
            <option value={'de'}>German</option>
          </select>
        </label>
        </div>

        <div className='filter'>
        <label>
          Streaming Services:
          <select name="streaming_services" value={filters.streaming_services} onChange={handleChange} multiple>
            <option value={'netflix'}>Netflix</option>
            <option value={'hulu'}>Hulu</option>
            <option value={'max'}>Max</option>
            <option value={'prime'}>Amazon Prime</option>
            <option value={'apple'}>Apple TV</option>
          </select>
        </label>
        </div>
        
        <div className='filter'>
        <label>Price:
          <select name='price' value={filters.price} onChange={handleChange} multiple>
            <option value="free">Free</option>
            <option value="ads">Ads</option>
            <option value="flatrate">Subscription</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
        </label>
        </div>
        
        <div className='filter'>
        <label>
          Minimum Release Year:
          <input max={2024} type='number' name='min_release_year' value={filters.min_release_year} onChange={handleChange} placeholder='Minimum Release Year...'/>
        </label>
        </div>
        

        <div className='filter'>
        <label>
          Maximum Release Year:
          <input type='number' name='max_release_year' value={filters.max_release_year} onChange={handleChange} placeholder='Maximum Release Year...'/>
        </label>
        </div>

        <div className='filter'>
        <label>
          Vote Count:
          <select name='vote_count' value={filters.vote_count} onChange={handleChange}>
            <option value=''>-- Select a vote count --</option>
            <option value={'10'}>&gt; 10</option>
            <option value={'100'}>&gt; 100</option>
            <option value={'500'}>&gt; 500</option>
            <option value={'1000'}>&gt; 1000</option>
            <option value={'5000'}>&gt; 5000</option>
          </select>
        </label>
        </div>

        <div className='filter'>
        <label>
          Title:
          <input type='text' name='title' value={filters.title} onChange={handleChange} placeholder='Movie Title...'/>
        </label>
        </div>

        <div className='filter'>
        <label>
          Sort By:
          <select name='sort' value={filters.sort} onChange={handleChange}>
            <option value="vote_average">Rating</option>
            <option value="popularity">Popularity</option>
            <option value="title">Alphabetical</option>
            <option value="release_date">Release Year</option>
          </select>
        </label>
        </div>

       <div className='filter'>
       <label>
          Sort Direction:
          <select name='sort_direction' value={filters.sort_direction} onChange={handleChange}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
       </div>

       <button className='filter-reset-button' onClick={handleReset}>Reset Filters</button>
      </div>
  )
}

export default DiscoverFilters