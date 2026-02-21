import React from 'react';
import './ElderMode.css';

function ElderMode({ isActive, onToggle }) {
  return (
    <button
      className={`elder-toggle ${isActive ? 'active' : ''}`}
      onClick={onToggle}
      title={isActive ? 'Elder/Caregiver Mode ON — Larger text, icons, voice search' : 'Enable Elder/Caregiver Mode for accessibility'}
      aria-label={isActive ? 'Disable Elder Mode' : 'Enable Elder Mode'}
    >
      <span className="elder-icon" aria-hidden="true">
        {/* Accessibility person SVG icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="M12 7v6" />
          <path d="M8 21l4-7 4 7" />
          <path d="M7 12h10" />
        </svg>
      </span>
      <span className="elder-text">
        {isActive ? 'Elder ON' : 'Elder'}
      </span>
    </button>
  );
}

export default ElderMode;
