import React from 'react';
import './EmergencyMode.css';

function EmergencyMode({ isActive, onToggle }) {
  return (
    <button 
      className={`emergency-toggle ${isActive ? 'active' : ''}`}
      onClick={onToggle}
      title={isActive ? 'Showing only open pharmacies, 24/7 highlighted, auto-zoom enabled' : 'Enable Emergency Mode for instant access'}
    >
      <span className="emergency-text">
        {isActive ? 'Emergency ON' : 'Emergency'}
      </span>
    </button>
  );
}

export default EmergencyMode;
