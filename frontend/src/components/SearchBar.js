/**
 * SearchBar — Medicine search input with auto-complete suggestions
 * 
 * Features:
 * - Live suggestions from the API as the user types (debounced at 2 chars)
 * - Web Speech API voice input for hands-free / accessibility
 * - Elder Mode styling with larger text and emoji hints
 */

import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, elderMode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
        <div className={`search-input-wrapper${elderMode ? ' elder' : ''}`}>
          <span className="search-icon">{elderMode ? '🔍' : '⌕'}</span>
          <input
            type="text"
            className="search-input"
            placeholder={elderMode ? 'Type or speak medicine name...' : 'Search medicine name (e.g., Paracetamol, Insulin...)'}
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
          <button
            type="button"
            className={`voice-btn${isListening ? ' listening' : ''}`}
            onClick={toggleVoiceSearch}
            title={isListening ? 'Listening...' : 'Voice search'}
            aria-label="Voice search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
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
