/**
 * Pharmacies Route — /api/pharmacies
 * 
 * Handles pharmacy discovery, nearby search (with Haversine distance),
 * real-time open/closed status, stock management (toggle/update),
 * and pharmacy detail updates for the dashboard.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load pharmacy data from JSON flat-file (MVP storage layer)
const dataPath = path.join(__dirname, '..', 'data', 'pharmacies.json');
let pharmaciesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

/**
 * Persist in-memory pharmacy data back to the JSON file.
 * Called after every write operation (stock update, detail change, etc.).
 */
function persist() {
  fs.writeFileSync(dataPath, JSON.stringify(pharmaciesData, null, 2), 'utf8');
}

/**
 * Determine if a pharmacy is currently open.
 * 24-hour pharmacies always return true; others are checked against
 * the current system time converted to minutes-since-midnight.
 */
function isPharmacyOpen(pharmacy) {
  if (pharmacy.is24Hours) return true;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
  
  const [openHour, openMin] = pharmacy.openTime.split(':').map(Number);
  const [closeHour, closeMin] = pharmacy.closeTime.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Haversine formula — calculate the great-circle distance (in km)
 * between two geographic coordinates (lat/lon in degrees).
 * Used to rank pharmacies by proximity to the user.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// GET all pharmacies
router.get('/', (req, res) => {
  const pharmaciesWithStatus = pharmaciesData.map(pharmacy => ({
    ...pharmacy,
    isOpen: isPharmacyOpen(pharmacy)
  }));
  
  res.json({
    success: true,
    count: pharmaciesWithStatus.length,
    data: pharmaciesWithStatus
  });
});

// GET nearby pharmacies
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 10, medicine, emergency } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }
  
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const searchRadius = parseFloat(radius);
  
  let results = pharmaciesData.map(pharmacy => {
    const distance = calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
    const isOpen = isPharmacyOpen(pharmacy);
    const hasMedicine = medicine ? 
      pharmacy.medicines.some(med => 
        med.toLowerCase().includes(medicine.toLowerCase())
      ) : true;
    
    return {
      ...pharmacy,
      distance: parseFloat(distance.toFixed(2)),
      isOpen,
      hasMedicine
    };
  });
  
  // Filter by radius
  results = results.filter(p => p.distance <= searchRadius);
  
  // Filter by medicine if specified
  if (medicine) {
    results = results.filter(p => p.hasMedicine);
  }
  
  // Emergency mode: only show open pharmacies
  if (emergency === 'true') {
    results = results.filter(p => p.isOpen);
    // Sort by distance and reliability
    results.sort((a, b) => {
      const scoreA = (a.distance * 0.7) + ((5 - a.reliabilityScore) * 0.3);
      const scoreB = (b.distance * 0.7) + ((5 - b.reliabilityScore) * 0.3);
      return scoreA - scoreB;
    });
  } else {
    // Normal mode: sort by distance
    results.sort((a, b) => a.distance - b.distance);
  }
  
  res.json({
    success: true,
    count: results.length,
    filters: {
      radius: searchRadius,
      medicine: medicine || null,
      emergency: emergency === 'true'
    },
    data: results
  });
});

// GET single pharmacy by ID
router.get('/:id', (req, res) => {
  const pharmacy = pharmaciesData.find(p => p.id === req.params.id);
  
  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      error: 'Pharmacy not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      ...pharmacy,
      isOpen: isPharmacyOpen(pharmacy)
    }
  });
});

// POST - Update pharmacy stock (for pharmacy dashboard)
router.post('/:id/stock', (req, res) => {
  const { medicines } = req.body;
  const pharmacyIndex = pharmaciesData.findIndex(p => p.id === req.params.id);
  
  if (pharmacyIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Pharmacy not found'
    });
  }
  
  pharmaciesData[pharmacyIndex].medicines = medicines;
  pharmaciesData[pharmacyIndex].lastUpdated = new Date().toISOString();
  persist();
  
  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: pharmaciesData[pharmacyIndex]
  });
});

// POST - Toggle a single medicine in/out of stock
router.post('/:id/stock/toggle', (req, res) => {
  const { medicine, inStock } = req.body;
  const idx = pharmaciesData.findIndex(p => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Pharmacy not found' });
  }

  const pharmacy = pharmaciesData[idx];
  const medLower = medicine.toLowerCase();

  if (inStock) {
    // Add medicine if not already present
    if (!pharmacy.medicines.some(m => m.toLowerCase() === medLower)) {
      pharmacy.medicines.push(medLower);
    }
  } else {
    // Remove medicine
    pharmacy.medicines = pharmacy.medicines.filter(m => m.toLowerCase() !== medLower);
  }

  pharmacy.lastUpdated = new Date().toISOString();
  persist();

  res.json({
    success: true,
    message: `${medicine} marked ${inStock ? 'in stock' : 'out of stock'}`,
    data: pharmacy
  });
});

// PUT - Update pharmacy details (hours, delivery, status)
router.put('/:id', (req, res) => {
  const idx = pharmaciesData.findIndex(p => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Pharmacy not found' });
  }

  const allowed = ['openTime', 'closeTime', 'is24Hours', 'hasDelivery', 'phone', 'address'];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      pharmaciesData[idx][key] = req.body[key];
      updates[key] = req.body[key];
    }
  }

  pharmaciesData[idx].lastUpdated = new Date().toISOString();
  persist();

  res.json({
    success: true,
    message: 'Pharmacy updated',
    updates,
    data: pharmaciesData[idx]
  });
});

// GET - Dashboard stats for a pharmacy
router.get('/:id/stats', (req, res) => {
  const pharmacy = pharmaciesData.find(p => p.id === req.params.id);

  if (!pharmacy) {
    return res.status(404).json({ success: false, error: 'Pharmacy not found' });
  }

  // Load medicine catalog for matching
  const medicinesData = require('../data/medicines.json');
  const totalCatalog = medicinesData.length;
  const inStockCount = pharmacy.medicines.length;
  const outStockCount = totalCatalog - inStockCount;

  res.json({
    success: true,
    data: {
      pharmacy: pharmacy.name,
      totalCatalog,
      inStock: inStockCount,
      outOfStock: outStockCount < 0 ? 0 : outStockCount,
      hasDelivery: pharmacy.hasDelivery,
      is24Hours: pharmacy.is24Hours,
      isOpen: isPharmacyOpen(pharmacy),
      reliabilityScore: pharmacy.reliabilityScore,
      lastUpdated: pharmacy.lastUpdated
    }
  });
});

module.exports = router;
