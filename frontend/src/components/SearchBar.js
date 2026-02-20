import React, { useState, useEffect } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      fetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const fetchSuggestions = async (query) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/medicines/search?q=${query}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.slice(0, 5)); // Show top 5
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Suggestion error:', error);
    }
  };

  const handleSelect = (medicine) => {
    setSearchTerm(medicine.name);
    setShowSuggestions(false);
    onSearch(medicine);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search medicine name (e.g., Paracetamol, Insulin...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((medicine) => (
              <div
                key={medicine.id}
                className="suggestion-item"
                onClick={() => handleSelect(medicine)}
              >
                <div className="suggestion-main">
                  <span className="medicine-name">{medicine.name}</span>
                  {medicine.genericName !== medicine.name && (
                    <span className="generic-name">({medicine.genericName})</span>
                  )}
                </div>
                <div className="suggestion-meta">
                  <span className="category">{medicine.category}</span>
                  <span className="price">₹{medicine.avgPrice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchBar;
