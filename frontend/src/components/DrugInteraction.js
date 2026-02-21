import React, { useState } from 'react';
import './DrugInteraction.css';

function DrugInteraction({ elderMode }) {
  const [medicines, setMedicines] = useState(['', '']);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const addMedicine = () => {
    if (medicines.length < 5) {
      setMedicines([...medicines, '']);
    }
  };

  const removeMedicine = (index) => {
    if (medicines.length > 2) {
      const updated = medicines.filter((_, i) => i !== index);
      setMedicines(updated);
    }
  };

  const updateMedicine = (index, value) => {
    const updated = [...medicines];
    updated[index] = value;
    setMedicines(updated);
    setActiveIndex(index);

    // Fetch suggestions
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/medicines/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Suggestion fetch error:', err);
    }
  };

  const selectSuggestion = (index, name) => {
    const updated = [...medicines];
    updated[index] = name;
    setMedicines(updated);
    setSuggestions([]);
    setActiveIndex(null);
  };

  const checkInteractions = async () => {
    const validMeds = medicines.filter(m => m.trim().length > 0);
    if (validMeds.length < 2) return;

    setLoading(true);
    setResults(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/medicines/interaction-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: validMeds }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data);
      }
    } catch (err) {
      console.error('Interaction check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const severityConfig = {
    high: { icon: '⚠', label: 'High Risk', className: 'severity-high' },
    moderate: { icon: '!', label: 'Moderate Risk', className: 'severity-moderate' },
    low: { icon: 'ℹ', label: 'Low Risk', className: 'severity-low' },
  };

  return (
    <div className="drug-interaction fade-in">
      <div className="di-header" onClick={() => setExpanded(!expanded)}>
        <div className="di-title-row">
          <h3 className="di-title">
            {elderMode ? '💊 ' : ''}Drug Interaction Checker
          </h3>
          <button className="di-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? '▾' : '▸'}
          </button>
        </div>
        <p className="di-subtitle">Check if your medicines are safe to take together</p>
      </div>

      {expanded && (
        <div className="di-body">
          <div className="di-inputs">
            {medicines.map((med, index) => (
              <div key={index} className="di-input-row">
                <div className="di-input-wrapper">
                  <span className="di-input-number">{index + 1}</span>
                  <input
                    type="text"
                    className="di-input"
                    value={med}
                    onChange={(e) => updateMedicine(index, e.target.value)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setTimeout(() => { setActiveIndex(null); setSuggestions([]); }, 200)}
                    placeholder={`Medicine ${index + 1}`}
                  />
                  {medicines.length > 2 && (
                    <button
                      className="di-remove-btn"
                      onClick={() => removeMedicine(index)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                  {/* Suggestions dropdown */}
                  {activeIndex === index && suggestions.length > 0 && (
                    <div className="di-suggestions">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          className="di-suggestion-item"
                          onMouseDown={() => selectSuggestion(index, s.name)}
                        >
                          <span className="di-sug-name">{s.name}</span>
                          <span className="di-sug-generic">{s.genericName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="di-actions">
            {medicines.length < 5 && (
              <button className="di-add-btn" onClick={addMedicine}>
                + Add Medicine
              </button>
            )}
            <button
              className="di-check-btn"
              onClick={checkInteractions}
              disabled={medicines.filter(m => m.trim()).length < 2 || loading}
            >
              {loading ? 'Checking...' : (elderMode ? '🔍 Check Interactions' : 'Check Interactions')}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="di-results fade-in">
              {results.interactionCount === 0 ? (
                <div className="di-safe">
                  <span className="di-safe-icon">✓</span>
                  <div className="di-safe-text">
                    <strong>No known interactions found</strong>
                    <span>These medicines appear safe to take together based on our database.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="di-warning-header">
                    <span className="di-warning-count">
                      {results.interactionCount} interaction{results.interactionCount > 1 ? 's' : ''} found
                    </span>
                  </div>
                  {results.interactions.map((interaction, i) => {
                    const config = severityConfig[interaction.severity];
                    return (
                      <div key={i} className={`di-interaction-card ${config.className}`}>
                        <div className="di-card-header">
                          <div className="di-drug-pair">
                            <span className="di-drug-name">{interaction.drug1}</span>
                            <span className="di-drug-separator">×</span>
                            <span className="di-drug-name">{interaction.drug2}</span>
                          </div>
                          <span className={`di-severity-badge ${config.className}`}>
                            {config.icon} {config.label}
                          </span>
                        </div>
                        <div className="di-card-body">
                          <p className="di-effect">{interaction.effect}</p>
                          <p className="di-detail">{interaction.detail}</p>
                          <div className="di-recommendation">
                            <span className="di-rec-label">Recommendation:</span>
                            <span className="di-rec-text">{interaction.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <p className="di-disclaimer">
                ⚕ {results.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DrugInteraction;
