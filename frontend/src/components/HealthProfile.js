import React, { useState, useEffect } from 'react';
import './HealthProfile.css';

const ALLERGY_OPTIONS = [
  { id: 'penicillin', label: 'Penicillin' },
  { id: 'nsaid', label: 'NSAIDs (Ibuprofen, Aspirin)' },
  { id: 'sulfa', label: 'Sulfa Drugs' },
  { id: 'macrolide', label: 'Macrolide Antibiotics' },
  { id: 'aspirin', label: 'Aspirin / Salicylates' },
  { id: 'statin', label: 'Statins' },
  { id: 'beta_lactam', label: 'Beta-Lactam' },
  { id: 'ppi', label: 'PPIs (Omeprazole)' },
];

const CONDITION_OPTIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'Hypertension (High BP)' },
  { id: 'heart_disease', label: 'Heart Disease' },
  { id: 'kidney_disease', label: 'Kidney Disease' },
  { id: 'liver_disease', label: 'Liver Disease' },
  { id: 'asthma', label: 'Asthma' },
  { id: 'bleeding_disorder', label: 'Bleeding Disorder' },
];

const DEFAULT_PROFILE = {
  allergies: [],
  ageGroup: 'adult',
  pregnant: false,
  conditions: [],
};

function HealthProfile({ profile, onProfileChange, onClose }) {
  const [localProfile, setLocalProfile] = useState(profile || DEFAULT_PROFILE);

  useEffect(() => {
    setLocalProfile(profile || DEFAULT_PROFILE);
  }, [profile]);

  const toggleItem = (field, id) => {
    setLocalProfile(prev => {
      const list = prev[field] || [];
      const updated = list.includes(id)
        ? list.filter(x => x !== id)
        : [...list, id];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = () => {
    localStorage.setItem('healthProfile', JSON.stringify(localProfile));
    onProfileChange(localProfile);
    onClose();
  };

  const handleClear = () => {
    const cleared = { ...DEFAULT_PROFILE };
    setLocalProfile(cleared);
    localStorage.removeItem('healthProfile');
    onProfileChange(cleared);
    onClose();
  };

  return (
    <div className="health-profile-overlay" onClick={onClose}>
      <div className="health-profile-panel" onClick={e => e.stopPropagation()}>
        <div className="hp-header">
          <div className="hp-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <h3>My Health Profile</h3>
          </div>
          <button className="hp-close" onClick={onClose}>✕</button>
        </div>

        <p className="hp-subtitle">Set your health info to get personalized safety checks. Stored locally on your device only.</p>

        {/* Age Group */}
        <div className="hp-section">
          <label className="hp-label">Age Group</label>
          <div className="hp-radio-group">
            {[
              { id: 'child', label: 'Child (< 12)' },
              { id: 'adult', label: 'Adult' },
              { id: 'elderly', label: 'Elderly (65+)' },
            ].map(opt => (
              <button
                key={opt.id}
                className={`hp-radio${localProfile.ageGroup === opt.id ? ' active' : ''}`}
                onClick={() => setLocalProfile(prev => ({ ...prev, ageGroup: opt.id }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pregnancy */}
        <div className="hp-section">
          <label className="hp-label">Pregnancy</label>
          <div className="hp-radio-group">
            <button
              className={`hp-radio${localProfile.pregnant ? ' active' : ''}`}
              onClick={() => setLocalProfile(prev => ({ ...prev, pregnant: true }))}
            >
              Pregnant / Planning
            </button>
            <button
              className={`hp-radio${!localProfile.pregnant ? ' active' : ''}`}
              onClick={() => setLocalProfile(prev => ({ ...prev, pregnant: false }))}
            >
              Not applicable
            </button>
          </div>
        </div>

        {/* Allergies */}
        <div className="hp-section">
          <label className="hp-label">Drug Allergies</label>
          <div className="hp-chip-grid">
            {ALLERGY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`hp-chip${localProfile.allergies.includes(opt.id) ? ' selected' : ''}`}
                onClick={() => toggleItem('allergies', opt.id)}
              >
                {localProfile.allergies.includes(opt.id) ? '✕ ' : '+ '}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="hp-section">
          <label className="hp-label">Chronic Conditions</label>
          <div className="hp-chip-grid">
            {CONDITION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`hp-chip${localProfile.conditions.includes(opt.id) ? ' selected' : ''}`}
                onClick={() => toggleItem('conditions', opt.id)}
              >
                {localProfile.conditions.includes(opt.id) ? '✕ ' : '+ '}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hp-actions">
          <button className="hp-btn-clear" onClick={handleClear}>Clear All</button>
          <button className="hp-btn-save" onClick={handleSave}>Save Profile</button>
        </div>

        <p className="hp-disclaimer">
          ⚕ Your data stays on this device. We never store or share personal health information.
        </p>
      </div>
    </div>
  );
}

export default HealthProfile;
