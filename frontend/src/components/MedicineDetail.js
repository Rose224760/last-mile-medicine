import React, { useState, useEffect } from 'react';
import './MedicineDetail.css';

function MedicineDetail({ medicine, healthProfile, elderMode }) {
  const [safetyResult, setSafetyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!medicine) {
      setSafetyResult(null);
      return;
    }
    runSafetyCheck();
  }, [medicine, healthProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSafetyCheck = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/medicines/safety-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: medicine.name,
          profile: healthProfile,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSafetyResult(data);
      }
    } catch (err) {
      console.error('Safety check error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!medicine) return null;

  const hasProfile = healthProfile.allergies.length > 0 ||
    healthProfile.conditions.length > 0 ||
    healthProfile.pregnant ||
    healthProfile.ageGroup !== 'adult';

  const statusConfig = {
    safe: {
      icon: '✓',
      label: 'Safe Based on Your Profile',
      className: 'status-safe',
    },
    caution: {
      icon: '!',
      label: 'Use with Caution',
      className: 'status-caution',
    },
    avoid: {
      icon: '✕',
      label: 'Not Recommended for You',
      className: 'status-avoid',
    },
  };

  return (
    <div className="medicine-detail fade-in">
      <div className="md-header" onClick={() => setExpanded(!expanded)}>
        <div className="md-title-row">
          <h3 className="md-title">
            {elderMode ? '🧪 ' : ''}Is This Safe for Me?
          </h3>
          <button className="md-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? '▾' : '▸'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="md-body">
          {loading ? (
            <div className="md-loading">
              <div className="md-spinner"></div>
              <span>Checking safety...</span>
            </div>
          ) : safetyResult ? (
            <>
              {/* Medicine info */}
              <div className="md-medicine-info">
                <div className="md-med-name">
                  <strong>{safetyResult.medicine.name}</strong>
                  {safetyResult.medicine.genericName !== safetyResult.medicine.name && (
                    <span className="md-generic">({safetyResult.medicine.genericName})</span>
                  )}
                </div>
                <div className="md-meta-row">
                  <span className="md-drug-class">{safetyResult.medicine.drugClass}</span>
                  <span className="md-category">{safetyResult.medicine.category}</span>
                  {safetyResult.medicine.requiresPrescription && (
                    <span className="md-rx">Rx</span>
                  )}
                </div>
                {safetyResult.medicine.composition && (
                  <div className="md-composition">
                    <span className="md-comp-label">Composition:</span>
                    {safetyResult.medicine.composition.join(', ')}
                  </div>
                )}

                {/* Safety Profile Icons */}
                <div className="md-safety-icons">
                  {safetyResult.medicine.pregnancySafety && (
                    <div className={`md-safety-icon md-safety-${safetyResult.medicine.pregnancySafety}`} title={`Pregnancy: ${safetyResult.medicine.pregnancySafety}`}>
                      <span className="md-safety-emoji">🤰</span>
                      <span className="md-safety-label">{safetyResult.medicine.pregnancySafety === 'safe' ? 'Safe' : safetyResult.medicine.pregnancySafety === 'caution' ? 'Caution' : 'Avoid'}</span>
                    </div>
                  )}
                  {safetyResult.medicine.ageRestrictions?.child && (
                    <div className={`md-safety-icon md-safety-${safetyResult.medicine.ageRestrictions.child}`} title={`Children: ${safetyResult.medicine.ageRestrictions.child}`}>
                      <span className="md-safety-emoji">👶</span>
                      <span className="md-safety-label">{safetyResult.medicine.ageRestrictions.child === 'safe' ? 'Safe' : safetyResult.medicine.ageRestrictions.child === 'caution' ? 'Caution' : 'Avoid'}</span>
                    </div>
                  )}
                  {safetyResult.medicine.ageRestrictions?.elderly && (
                    <div className={`md-safety-icon md-safety-${safetyResult.medicine.ageRestrictions.elderly}`} title={`Elderly: ${safetyResult.medicine.ageRestrictions.elderly}`}>
                      <span className="md-safety-emoji">👴</span>
                      <span className="md-safety-label">{safetyResult.medicine.ageRestrictions.elderly === 'safe' ? 'Safe' : safetyResult.medicine.ageRestrictions.elderly === 'caution' ? 'Caution' : 'Avoid'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety verdict */}
              {hasProfile ? (
                <div className={`md-verdict ${statusConfig[safetyResult.safety.status].className}`}>
                  <span className="md-verdict-icon">
                    {statusConfig[safetyResult.safety.status].icon}
                  </span>
                  <div className="md-verdict-text">
                    <strong>{statusConfig[safetyResult.safety.status].label}</strong>
                    {safetyResult.safety.warnings.length === 0 && (
                      <span className="md-verdict-sub">No safety concerns detected for your profile</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="md-no-profile">
                  <span className="md-no-profile-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </span>
                  <span>Set up your <strong>Health Profile</strong> to get personalized safety checks</span>
                </div>
              )}

              {/* Warnings list */}
              {safetyResult.safety.warnings.length > 0 && (
                <div className="md-warnings">
                  {safetyResult.safety.warnings.map((w, i) => (
                    <div key={i} className={`md-warning md-warning-${w.level}`}>
                      <div className="md-warning-header">
                        <span className="md-warning-badge">
                          {w.level === 'avoid' ? '✕' : '!'} {w.type === 'allergy' ? 'Allergy' : w.type === 'age' ? 'Age' : w.type === 'pregnancy' ? 'Pregnancy' : 'Condition'}
                        </span>
                        <span className="md-warning-msg">{w.message}</span>
                      </div>
                      <p className="md-warning-detail">{w.details}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Safe alternatives */}
              {safetyResult.safety.alternatives && safetyResult.safety.alternatives.length > 0 && (
                <div className="md-alternatives">
                  <h4 className="md-alt-title">Safer Alternatives</h4>
                  {safetyResult.safety.alternatives.map((alt, i) => (
                    <div key={i} className="md-alt-item">
                      <span className="md-alt-check">✓</span>
                      <span className="md-alt-name">{alt.name}</span>
                      {alt.drugClass && <span className="md-alt-class">{alt.drugClass}</span>}
                      {alt.avgPrice && <span className="md-alt-price">₹{alt.avgPrice}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Side effects */}
              {safetyResult.medicine.sideEffects && safetyResult.medicine.sideEffects.length > 0 && (
                <div className="md-side-effects">
                  <h4 className="md-se-title">Known Side Effects</h4>
                  <div className="md-se-list">
                    {safetyResult.medicine.sideEffects.map((se, i) => (
                      <span key={i} className="md-se-tag">{se}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="md-disclaimer">
                ⚕ {safetyResult.disclaimer}
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default MedicineDetail;
