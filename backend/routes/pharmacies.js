const express = require('express');
const router = express.Router();
const pharmaciesData = require('../data/pharmacies.json');

// Helper function to check if pharmacy is currently open
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

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
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
  
  // In a real app, this would update the database
  pharmaciesData[pharmacyIndex].medicines = medicines;
  pharmaciesData[pharmacyIndex].lastUpdated = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: pharmaciesData[pharmacyIndex]
  });
});

module.exports = router;
