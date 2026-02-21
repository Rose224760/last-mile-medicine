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

// Professional colored custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const pharmacyIcon = (isOpen) => new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="24" height="30">
      <path d="M12 0C7 0 3 4 3 9c0 7 9 21 9 21s9-14 9-21c0-5-4-9-9-9z" fill="${isOpen ? '#2563eb' : '#94a3b8'}" />
      <path d="M8 9h8M12 5v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [24, 30],
  iconAnchor: [12, 30],
  popupAnchor: [0, -30],
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          <div className="popup-content">
            <strong>Your Location</strong>
          </div>
        </Popup>
      </Marker>

      {/* Search radius circle */}
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={10000}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.05,
          weight: 1,
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
                  {pharmacy.isOpen ? 'Open' : 'Closed'}
                </span>
                {pharmacy.is24Hours && <span className="badge-24">24/7</span>}
              </div>
              <p className="popup-address">{pharmacy.address}</p>
              <p className="popup-distance">{pharmacy.distance} km away</p>
              <p className="popup-hours">
                {pharmacy.is24Hours ? '24h' : `${pharmacy.openTime}–${pharmacy.closeTime}`}
              </p>
              {pharmacy.hasDelivery && <p className="popup-delivery">Delivery available</p>}
              <a href={`tel:${pharmacy.phone}`} className="call-btn">
                Call
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default PharmacyMap;
