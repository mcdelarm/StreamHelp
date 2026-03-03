import React from 'react'
import { useState, useEffect } from 'react'

const StreamingOptions = ({id}) => {
  const [streamingOptions, setStreamingOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStreamingOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/streaming-options/${id}/`);
        const data = await response.json();
        const groupedOptions = data.reduce((acc, option) => {
          if (!acc[option.type]) {
            acc[option.type] = [];
          }
          acc[option.type].push(option);
          return acc;
        }, {});
        if (groupedOptions.flatrate) {
          groupedOptions.subscription = groupedOptions.flatrate;
        delete groupedOptions.flatrate;
        }
        setStreamingOptions(groupedOptions)
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
      <h3>Streaming Options</h3>
      {isEmpty ? (
        <p className='no-options-message'>No streaming information available for this movie.</p>
      ): (
        sortedKeys.map((type) => (
          <div className='streaming-option-type-container' key={type}>
            <span className='option-type-label'>{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
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