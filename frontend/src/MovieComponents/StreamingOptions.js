import React from 'react'
import { useState, useEffect } from 'react'

const StreamingOptions = ({id}) => {
  const [streamingOptions, setStreamingOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStreamingOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/streaming-options/${id}/`);
        const data = await response.json();
        const groupedOptions = data.reduce((acc, option) => {
          if (!acc[option.type]) {
            acc[option.type] = [];
          }
          acc[option.type].push(option);
          return acc;
        }, {});
        console.log(groupedOptions);
        if (groupedOptions.flatrate) {
          groupedOptions.subscription = groupedOptions.flatrate;
        delete groupedOptions.flatrate;
        }
        setStreamingOptions(groupedOptions)
        console.log(groupedOptions);
      } catch (error) {
        console.log("Error fetching streaming options")
      } finally {
        setLoading(false)
      }
      
    };
    fetchStreamingOptions();
  }, [id]);

  const order = ['free', 'ads', 'subscription', 'rent', 'buy'];

  const sortedKeys = Object.keys(streamingOptions).sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const isEmpty = Object.keys(streamingOptions).length === 0;

  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <div className='streaming-options-container'>
      {isEmpty ? (
        <p className='no-options-message'>No streaming information available for this movie.</p>
      ): (
        sortedKeys.map((type) => (
          <div className='streaming-option-type-container' key={type}>
            <label className='option-type-label'>{type.charAt(0).toUpperCase() + type.slice(1)} Options:</label>
            <ul className='streaming-option-type-list'>
              {streamingOptions[type].map((option) => (
                <li className='streaming-option' key={option.provider_name}>
                  {option.provider_name}
                  <img className='provider-logo' src={option.provider_logo} alt={`${option.provider_name} logo`}/>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      
    </div>
  )
}

export default StreamingOptions