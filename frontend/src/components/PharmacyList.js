import React, { useState, useEffect } from 'react';
import './PharmacyList.css';

// Helper to get relative time string
const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

function PharmacyList({ pharmacies, emergencyMode, selectedMedicine, elderMode }) {
  const [verifications, setVerifications] = useState({});

  // Load verifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('medicineVerifications');
    if (stored) {
      try {
        setVerifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load verifications:', e);
      }
    }
  }, []);

  // Handle verification
  const handleVerify = (pharmacyId, medicineName, found) => {
    const key = `${pharmacyId}-${medicineName}`;
    const newVerifications = {
      ...verifications,
      [key]: {
        found,
        timestamp: Date.now(),
        pharmacyId,
        medicineName
      }
    };
    setVerifications(newVerifications);
    localStorage.setItem('medicineVerifications', JSON.stringify(newVerifications));
  };

  // Get verification for a pharmacy-medicine combo
  const getVerification = (pharmacyId, medicineName) => {
    if (!medicineName) return null;
    const key = `${pharmacyId}-${medicineName}`;
    return verifications[key];
  };
  if (pharmacies.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-icon">—</p>
        <h3>No pharmacies found</h3>
        <p>Try searching for a medicine or adjusting your filters</p>
        {selectedMedicine && Object.keys(verifications).length > 0 && (
          <div className="empty-state-tip">
            <span>💡 Community verifications help others find medicines faster</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pharmacy-list">
      <div className="list-header">
        <h2>Nearby Pharmacies ({pharmacies.length})</h2>
        {emergencyMode && (
          <span className="emergency-badge">🆘 Emergency Mode</span>
        )}
      </div>
      
      {/* Community Stats Banner */}
      {selectedMedicine && Object.keys(verifications).length > 0 && (
        <div className="community-banner">
          <span className="community-icon">•</span>
          <div className="community-text">
            <strong>Community-Verified Stock</strong>
            <span>Real-time updates from users like you</span>
          </div>
        </div>
      )}
      
      {emergencyMode && pharmacies.length > 0 && (
        <div className="emergency-notice">
          <strong>Emergency Mode Active</strong>
          <p>Showing only open pharmacies • 24/7 stores highlighted</p>
        </div>
      )}

      <div className="pharmacy-cards">
        {pharmacies
          .map((pharmacy, index) => ({ pharmacy, index, verification: selectedMedicine ? getVerification(pharmacy.id, selectedMedicine.name) : null }))
          .sort((a, b) => {
            // Sort verified pharmacies first
            if (a.verification?.found && !b.verification?.found) return -1;
            if (!a.verification?.found && b.verification?.found) return 1;
            return 0;
          })
          .map(({ pharmacy, index, verification }) => (
            <div key={pharmacy.id} className="pharmacy-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="pharmacy-rank">#{index + 1}</span>
                  <h3>
                    {pharmacy.name}
                    {verification && verification.found && (
                      <span className="verified-indicator" title="Community verified stock">✓</span>
                    )}
                  </h3>
                </div>
                <div className="card-badges">
                  <span className={`status-badge ${pharmacy.isOpen ? 'open' : 'closed'}`}>
                    {pharmacy.isOpen ? 'Open' : 'Closed'}
                  </span>
                  {pharmacy.is24Hours && (
                    <span className="badge-24">24/7</span>
                  )}
                </div>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="info-text">{pharmacy.address}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-text">
                    {pharmacy.distance} km · ~{Math.ceil(pharmacy.distance * 15)} min
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-text">
                    {pharmacy.is24Hours 
                      ? '24h' 
                      : `${pharmacy.openTime}–${pharmacy.closeTime}`}
                  </span>
                </div>

                {pharmacy.hasDelivery && (
                  <div className="info-row">
                    <span className="info-text">Delivery available</span>
                  </div>
                )}

                {pharmacy.hasMedicine && selectedMedicine && (
                  <div className="medicine-available">
                    <span>Likely has {selectedMedicine.name}</span>
                  </div>
                )}
              </div>

              {/* Crowd Verification Section */}
              {selectedMedicine && (
                <div className="verification-section">
                  {verification ? (
                    <div className={`verification-status ${verification.found ? 'verified' : 'out-of-stock'}`}>
                      <span className="verification-icon">
                        {verification.found ? '✓' : '✗'}
                      </span>
                      <div className="verification-info">
                        <strong>
                          {verification.found ? 'Confirmed available' : 'Reported out of stock'}
                        </strong>
                        <span className="verification-time">{getRelativeTime(verification.timestamp)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="verification-prompt">
                      <span className="verification-label">{elderMode ? '👥 Help others:' : 'Help the community:'}</span>
                      <div className="verification-buttons">
                        <button
                          className="verify-btn found"
                          onClick={() => handleVerify(pharmacy.id, selectedMedicine.name, true)}
                        >
                          ✓ {elderMode ? 'Yes' : 'Found'}
                        </button>
                        <button
                          className="verify-btn out"
                          onClick={() => handleVerify(pharmacy.id, selectedMedicine.name, false)}
                        >
                          ✗ {elderMode ? 'No' : 'Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="card-footer">
              {!emergencyMode && (
                <div className="reliability">
                  <span>{pharmacy.reliabilityScore}/5</span>
                  <span className="reliability-text">Reliability Score</span>
                </div>
              )}
              
              <div className={`card-actions ${emergencyMode ? 'emergency-actions' : ''}`}>
                <a 
                  href={`tel:${pharmacy.phone}`} 
                  className={`action-btn primary ${emergencyMode ? 'emergency-call' : ''}`}
                >
                  {emergencyMode ? '📞 Call Now' : (elderMode ? '📞 Call' : 'Call')}
                </a>
                {!emergencyMode && selectedMedicine && (
                  <a
                    href={`https://wa.me/${pharmacy.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hi ${pharmacy.name},\n\nI'm looking for *${selectedMedicine.name}*. Do you have it in stock?\n\nSent via Last Mile Medicine`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn whatsapp-btn"
                  >
                    {elderMode ? '💬 WhatsApp' : 'WhatsApp'}
                  </a>
                )}
                {!emergencyMode && selectedMedicine && (
                  <a
                    href={`sms:${pharmacy.phone}?body=${encodeURIComponent(
                      `Hi ${pharmacy.name}, is ${selectedMedicine.name} available? - via Last Mile Medicine`
                    )}`}
                    className="action-btn sms-btn"
                  >
                    {elderMode ? '✉ SMS' : 'SMS'}
                  </a>
                )}
                {!emergencyMode && (
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn secondary"
                  >
                    {elderMode ? '🗺️ Directions' : 'Directions'}
                  </a>
                )}
              </div>
            </div>
          </div>
          ))}
      </div>
    </div>
  );
}

export default PharmacyList;
