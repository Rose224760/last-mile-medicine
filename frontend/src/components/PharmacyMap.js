import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PharmacyMap.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
      <circle cx="12" cy="12" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pharmacyIcon = (isOpen) => new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isOpen ? '#10b981' : '#ef4444'}" width="36" height="36">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 9h-4v4h-4v-4H6v-4h4V4h4v4h4v4z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

function PharmacyMap({ pharmacies, userLocation, selectedMedicine, emergencyMode }) {
  if (!userLocation) return <div className="map-loading">Loading map...</div>;

  // Emergency Mode: Calculate zoom to show closest pharmacy
  const getEmergencyZoom = () => {
    if (!emergencyMode || pharmacies.length === 0) return 13;
    const closestDistance = Math.min(...pharmacies.map(p => p.distance));
    if (closestDistance < 1) return 15;
    if (closestDistance < 3) return 14;
    return 13;
  };

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={getEmergencyZoom()}
      style={{ height: '100%', width: '100%' }}
      className="pharmacy-map"
      key={emergencyMode ? 'emergency' : 'normal'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          <div className="popup-content">
            <strong>📍 Your Location</strong>
          </div>
        </Popup>
      </Marker>

      {/* Search radius circle */}
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={10000} // 10km
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
        }}
      />

      {/* Pharmacy markers */}
      {pharmacies.map((pharmacy) => (
        <Marker
          key={pharmacy.id}
          position={[pharmacy.latitude, pharmacy.longitude]}
          icon={pharmacyIcon(pharmacy.isOpen)}
        >
          <Popup>
            <div className="popup-content">
              <h3>{pharmacy.name}</h3>
              <div className="popup-status">
                <span className={`status-badge ${pharmacy.isOpen ? 'open' : 'closed'}`}>
                  {pharmacy.isOpen ? '🟢 Open' : '🔴 Closed'}
                </span>
                {pharmacy.is24Hours && <span className="badge-24">24/7</span>}
              </div>
              <p className="popup-address">📍 {pharmacy.address}</p>
              <p className="popup-distance">🚶 {pharmacy.distance} km away</p>
              <p className="popup-hours">
                ⏰ {pharmacy.is24Hours ? 'Open 24 Hours' : `${pharmacy.openTime} - ${pharmacy.closeTime}`}
              </p>
              {pharmacy.hasDelivery && <p className="popup-delivery">🚚 Delivery Available</p>}
              <a href={`tel:${pharmacy.phone}`} className="call-btn">
                📞 Call Now
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default PharmacyMap;
