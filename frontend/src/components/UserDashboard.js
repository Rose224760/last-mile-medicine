import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

function UserDashboard({ onSearch, onOpenHealthProfile, onToggleEmergency, elderMode }) {
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedMeds, setSavedMeds] = useState([]);

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(hist);
    } catch (e) { /* ignore */ }
    try {
      const saved = JSON.parse(localStorage.getItem('savedMedicines') || '[]');
      setSavedMeds(saved);
    } catch (e) { /* ignore */ }
  }, []);

  const handleHistoryClick = (item) => {
    if (onSearch) onSearch({ name: item.name });
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const removeSaved = (name) => {
    const updated = savedMeds.filter(m => m !== name);
    setSavedMeds(updated);
    localStorage.setItem('savedMedicines', JSON.stringify(updated));
  };

  const handleSavedClick = (name) => {
    if (onSearch) onSearch({ name });
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="user-dashboard fade-in">
      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action" onClick={() => document.querySelector('.search-input')?.focus()}>
          <div className="qa-icon blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <div>
            <div className="qa-text">{elderMode ? '🔍 Search' : 'Search'}</div>
            <div className="qa-desc">Find medicine</div>
          </div>
        </button>
        <button className="quick-action" onClick={onToggleEmergency}>
          <div className="qa-icon red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <div>
            <div className="qa-text">{elderMode ? '🚨 Emergency' : 'Emergency'}</div>
            <div className="qa-desc">Open pharmacies</div>
          </div>
        </button>
        <button className="quick-action" onClick={onOpenHealthProfile}>
          <div className="qa-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <div className="qa-text">{elderMode ? '❤ Health' : 'Health Profile'}</div>
            <div className="qa-desc">Allergies & safety</div>
          </div>
        </button>
        <button className="quick-action" onClick={() => {
          const name = prompt('Save a chronic medicine name:');
          if (name && name.trim()) {
            const updated = [...savedMeds, name.trim()];
            setSavedMeds(updated);
            localStorage.setItem('savedMedicines', JSON.stringify(updated));
          }
        }}>
          <div className="qa-icon amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
          </div>
          <div>
            <div className="qa-text">{elderMode ? '💊 Save Med' : 'Save Medicine'}</div>
            <div className="qa-desc">Chronic tracking</div>
          </div>
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="dash-row">
        {/* Recent Searches */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h4>Recent Searches</h4>
            {searchHistory.length > 0 && (
              <button className="clear-link" onClick={clearHistory}>Clear</button>
            )}
          </div>
          <div className="dash-card-body">
            {searchHistory.length > 0 ? (
              searchHistory.slice(-8).reverse().map((item, i) => (
                <div className="history-item" key={i} onClick={() => handleHistoryClick(item)}>
                  <span className="hi-name">{item.name}</span>
                  <span className="hi-time">{timeAgo(item.time)}</span>
                </div>
              ))
            ) : (
              <div className="empty-dash">No searches yet. Try searching for a medicine above.</div>
            )}
          </div>
        </div>

        {/* Saved Chronic Medicines */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h4>Saved Medicines</h4>
          </div>
          <div className="dash-card-body">
            {savedMeds.length > 0 ? (
              savedMeds.map((name, i) => (
                <div className="saved-item" key={i}>
                  <span className="si-name" onClick={() => handleSavedClick(name)}>{name}</span>
                  <button className="si-remove" onClick={() => removeSaved(name)} title="Remove">&times;</button>
                </div>
              ))
            ) : (
              <div className="empty-dash">Save chronic medicines for quick access.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility: call this after every search to persist history
export function addToSearchHistory(medicineName) {
  try {
    const hist = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    // Avoid duplicates in a row
    if (hist.length > 0 && hist[hist.length - 1].name === medicineName) return;
    hist.push({ name: medicineName, time: new Date().toISOString() });
    // Keep last 20
    if (hist.length > 20) hist.splice(0, hist.length - 20);
    localStorage.setItem('searchHistory', JSON.stringify(hist));
  } catch (e) { /* ignore */ }
}

export default UserDashboard;
