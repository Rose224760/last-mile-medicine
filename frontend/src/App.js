import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import PharmacyMap from './components/PharmacyMap';
import PharmacyList from './components/PharmacyList';
import EmergencyMode from './components/EmergencyMode';
import PhotoUpload from './components/PhotoUpload';
import './App.css';

function App() {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error);
          // Default to Bangalore coordinates
          setUserLocation({
            lat: parseFloat(process.env.REACT_APP_DEFAULT_LAT),
            lng: parseFloat(process.env.REACT_APP_DEFAULT_LNG)
          });
        }
      );
    } else {
      // Default location
      setUserLocation({
        lat: parseFloat(process.env.REACT_APP_DEFAULT_LAT),
        lng: parseFloat(process.env.REACT_APP_DEFAULT_LNG)
      });
    }
  }, []);

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
    <div className="App">
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
            <EmergencyMode 
              isActive={emergencyMode}
              onToggle={handleEmergencyToggle}
            />
          </div>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Find Your Medicine in Seconds</h2>
          <p className="hero-subtitle">
            Search nearby pharmacies with real-time availability, emergency access, 
            and generic alternatives.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
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
            <h3 className="search-title">Search Medicine</h3>
            <div className="search-controls">
              <button 
                className="photo-upload-btn"
                onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              >
                {showPhotoUpload ? 'Hide Scanner' : 'Upload Prescription'}
              </button>
            </div>
          </div>
          
          <SearchBar onSearch={handleSearch} />
          
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

        {!loading && userLocation && (
          <div className="results-container fade-in">
            <div className="map-container">
              {emergencyMode && (
                <div className="map-emergency-badge">🆘 Emergency: Auto-zoomed to closest</div>
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
              />
            </div>
          </div>
        )}

        {!selectedMedicine && !loading && (
          <div className="welcome-state fade-in">
            <div className="welcome-card">
              <h2>How It Works</h2>
              <div className="features-grid">
                <div className="feature">
                  <span className="feature-icon">💊</span>
                  <h3>Smart Search</h3>
                  <p>Search by text or upload prescriptions with AI-powered recognition</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🗺️</span>
                  <h3>Live Mapping</h3>
                  <p>Real-time pharmacy locations with distance and availability</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🚑</span>
                  <h3>Emergency Mode</h3>
                  <p>Filter open pharmacies with fastest routes for urgent needs</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">💰</span>
                  <h3>Save Money</h3>
                  <p>Generic alternatives and price comparison across pharmacies</p>
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
            <p>Making healthcare accessible for everyone.</p>
          </div>
          <div className="footer-section">
            <h3>Platform</h3>
            <a href="/">For Users</a>
            <a href="/">For Pharmacies</a>
            <a href="/">Mobile App</a>
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
    </div>
  );
}

export default App;
