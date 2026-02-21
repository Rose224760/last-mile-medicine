/**
 * App.js — Root component for Last Mile Medicine
 * 
 * Manages top-level application state (pharmacies, search results,
 * emergency/elder mode, health profile) and composes all feature
 * components into the main user interface.
 */

import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import PharmacyMap from './components/PharmacyMap';
import PharmacyList from './components/PharmacyList';
import EmergencyMode from './components/EmergencyMode';
import ElderMode from './components/ElderMode';
import PhotoUpload from './components/PhotoUpload';
import HealthProfile from './components/HealthProfile';
import MedicineDetail from './components/MedicineDetail';
import DrugInteraction from './components/DrugInteraction';
import UserDashboard, { addToSearchHistory } from './components/UserDashboard';
import './App.css';

function App() {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [elderMode, setElderMode] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showHealthProfile, setShowHealthProfile] = useState(false);
  const [healthProfile, setHealthProfile] = useState({
    allergies: [],
    ageGroup: 'adult',
    pregnant: false,
    conditions: [],
  });

  // Load health profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('healthProfile');
    if (stored) {
      try {
        setHealthProfile(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load health profile:', e);
      }
    }
  }, []);

  // Set default location (Thrissur) on mount
  useEffect(() => {
    setUserLocation({
      lat: parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 10.5276,
      lng: parseFloat(process.env.REACT_APP_DEFAULT_LNG) || 76.2144
    });
  }, []);

  /**
   * handleSearch — Fetch nearby pharmacies that stock the selected medicine.
   * Calls the backend /api/pharmacies/nearby endpoint with user coordinates,
   * search radius, and emergency flag. Results are sorted and filtered
   * client-side when Emergency Mode is active.
   */
  const handleSearch = async (medicine) => {
    if (!userLocation) return;
    
    setLoading(true);
    setSelectedMedicine(medicine);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const params = new URLSearchParams({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 10,
        medicine: medicine.name,
        emergency: emergencyMode
      });
      
      const response = await fetch(`${apiUrl}/pharmacies/nearby?${params}`);
      const data = await response.json();
      
      if (data.success) {
        let results = data.data;

        // Track search history
        addToSearchHistory(medicine.name);
        
        // Emergency Mode: Filter only open pharmacies
        if (emergencyMode) {
          results = results.filter(p => p.isOpen);
          // Sort 24/7 stores first, then by distance
          results.sort((a, b) => {
            if (a.is24Hours && !b.is24Hours) return -1;
            if (!a.is24Hours && b.is24Hours) return 1;
            return a.distance - b.distance;
          });
        }
        
        setPharmacies(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyToggle = () => {
    const newEmergencyMode = !emergencyMode;
    setEmergencyMode(newEmergencyMode);
    
    // Re-filter existing results if available
    if (selectedMedicine && pharmacies.length > 0) {
      if (newEmergencyMode) {
        // Filter to show only open pharmacies and sort
        const filtered = [...pharmacies].filter(p => p.isOpen);
        filtered.sort((a, b) => {
          if (a.is24Hours && !b.is24Hours) return -1;
          if (!a.is24Hours && b.is24Hours) return 1;
          return a.distance - b.distance;
        });
        setPharmacies(filtered);
      } else {
        // Re-search to get all results
        handleSearch(selectedMedicine);
      }
    }
  };

  return (
    <div className={`App${elderMode ? ' elder-mode' : ''}`}>
      <header className="app-header">
        <nav className="header-nav">
          <div className="header-brand">
            <div className="brand-logo">+</div>
            <div className="brand-text">
              <h1>Last Mile Medicine</h1>
              <p className="tagline">Find medicines nearby, instantly</p>
            </div>
          </div>
          <div className="header-actions">
            <span className="role-indicator">User</span>
            <button
              className={`health-profile-btn${healthProfile.allergies.length > 0 || healthProfile.conditions.length > 0 ? ' has-profile' : ''}`}
              onClick={() => setShowHealthProfile(true)}
              title="My Health Profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              <span>{elderMode ? '❤ Health' : 'Health'}</span>
            </button>
            <ElderMode
              isActive={elderMode}
              onToggle={() => setElderMode(!elderMode)}
            />
            <EmergencyMode 
              isActive={emergencyMode}
              onToggle={handleEmergencyToggle}
            />
          </div>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Find your medicine in seconds</h2>
          <p className="hero-subtitle">
            Search nearby pharmacies with real-time availability and generic alternatives.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Pharmacies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Emergency</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">80%</span>
              <span className="stat-label">Time Saved</span>
            </div>
          </div>
        </div>
      </section>

      <main className="app-main">
        <div className="search-section">
          <div className="search-header">
            <h3 className="search-title">{elderMode ? '🔍 Search Medicine' : 'Search Medicine'}</h3>
            <div className="search-controls">
              <button 
                className="photo-upload-btn"
                onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              >
                {showPhotoUpload ? (elderMode ? '✕ Hide' : 'Hide Scanner') : (elderMode ? '📷 Upload' : 'Upload Prescription')}
              </button>
            </div>
          </div>
          
          <SearchBar onSearch={handleSearch} elderMode={elderMode} />
          
          {showPhotoUpload && (
            <div className="fade-in">
              <PhotoUpload onMedicinesDetected={(medicines) => {
                if (medicines.length > 0) {
                  handleSearch({ name: medicines[0] });
                }
                setShowPhotoUpload(false);
              }} />
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-state fade-in">
            <div className="spinner"></div>
            <p>Searching nearby pharmacies...</p>
          </div>
        )}

        {selectedMedicine && !loading && (
          <MedicineDetail
            medicine={selectedMedicine}
            healthProfile={healthProfile}
            elderMode={elderMode}
          />
        )}

        {selectedMedicine && !loading && (
          <DrugInteraction elderMode={elderMode} />
        )}

        {!loading && userLocation && (
          <div className="results-container fade-in">
            <div className="map-container">
              {emergencyMode && (
                <div className="map-emergency-badge">Emergency • Closest open pharmacies</div>
              )}
              <PharmacyMap 
                pharmacies={pharmacies}
                userLocation={userLocation}
                selectedMedicine={selectedMedicine}
                emergencyMode={emergencyMode}
              />
            </div>
            <div className="list-container">
              <PharmacyList 
                pharmacies={pharmacies}
                emergencyMode={emergencyMode}
                selectedMedicine={selectedMedicine}
                elderMode={elderMode}
              />
            </div>
          </div>
        )}

        {!selectedMedicine && !loading && (
          <div className="welcome-state fade-in">
            <UserDashboard
              onSearch={handleSearch}
              onOpenHealthProfile={() => setShowHealthProfile(true)}
              onToggleEmergency={handleEmergencyToggle}
              elderMode={elderMode}
            />
            <div className="welcome-card">
              <h2>How it works</h2>
              <div className="features-grid">
                <div className="feature">
                  <span className="feature-icon">{elderMode ? '🔍' : '•'}</span>
                  <h3>Search</h3>
                  <p>{elderMode ? 'Type or speak a medicine name' : 'Find medicines by name or upload a prescription'}</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">{elderMode ? '📍' : '•'}</span>
                  <h3>Locate</h3>
                  <p>{elderMode ? 'See nearby pharmacies on a map' : 'See pharmacies on a map with real-time availability'}</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">{elderMode ? '🚨' : '•'}</span>
                  <h3>Emergency</h3>
                  <p>{elderMode ? 'Find open pharmacies fast' : 'Filter open pharmacies with fastest routes'}</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">{elderMode ? '💊' : '•'}</span>
                  <h3>Compare</h3>
                  <p>{elderMode ? 'Find cheaper alternatives' : 'Generic alternatives and price comparison'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Last Mile Medicine</h3>
            <p>Making healthcare accessible.</p>
          </div>
          <div className="footer-section">
            <h3>Platform</h3>
            <a href="/">For Users</a>
            <a href="/pharmacy-dashboard.html">For Pharmacies</a>
            <a href="/admin-dashboard.html">For Admins</a>
          </div>
          <div className="footer-section">
            <h3>Company</h3>
            <a href="/">About</a>
            <a href="/">Careers</a>
            <a href="/">Contact</a>
          </div>
          <div className="footer-section">
            <h3>Legal</h3>
            <a href="/">Privacy</a>
            <a href="/">Terms</a>
            <a href="/">Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Last Mile Medicine &middot; SDG 3: Good Health &amp; Well-Being</p>
        </div>
      </footer>

      {showHealthProfile && (
        <HealthProfile
          profile={healthProfile}
          onProfileChange={setHealthProfile}
          onClose={() => setShowHealthProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
