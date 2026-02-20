const express = require('express');
const router = express.Router();
const medicinesData = require('../data/medicines.json');

// GET all medicines
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: medicinesData.length,
    data: medicinesData
  });
});

// GET search medicines
router.get('/search', (req, res) => {
  const { q, category } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Search query must be at least 2 characters'
    });
  }
  
  const searchTerm = q.toLowerCase();
  
  let results = medicinesData.filter(med => {
    const matchesName = med.name.toLowerCase().includes(searchTerm);
    const matchesGeneric = med.genericName.toLowerCase().includes(searchTerm);
    const matchesBrand = med.brandNames.some(brand => 
      brand.toLowerCase().includes(searchTerm)
    );
    const matchesCategory = category ? 
      med.category.toLowerCase() === category.toLowerCase() : true;
    
    return (matchesName || matchesGeneric || matchesBrand) && matchesCategory;
  });
  
  // Sort by relevance (exact matches first)
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === searchTerm;
    const bExact = b.name.toLowerCase() === searchTerm;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
  
  res.json({
    success: true,
    count: results.length,
    query: q,
    data: results
  });
});

// GET medicine by ID
router.get('/:id', (req, res) => {
  const medicine = medicinesData.find(m => m.id === req.params.id);
  
  if (!medicine) {
    return res.status(404).json({
      success: false,
      error: 'Medicine not found'
    });
  }
  
  res.json({
    success: true,
    data: medicine
  });
});

// GET generic alternatives
router.get('/:id/alternatives', (req, res) => {
  const medicine = medicinesData.find(m => m.id === req.params.id);
  
  if (!medicine) {
    return res.status(404).json({
      success: false,
      error: 'Medicine not found'
    });
  }
  
  // Find medicines with same generic name but different name (alternatives)
  const alternatives = medicinesData.filter(m => 
    m.genericName === medicine.genericName && m.id !== medicine.id
  );
  
  // Sort by price (cheapest first)
  alternatives.sort((a, b) => a.avgPrice - b.avgPrice);
  
  res.json({
    success: true,
    originalMedicine: medicine,
    count: alternatives.length,
    data: alternatives,
    savings: alternatives.length > 0 ? 
      medicine.avgPrice - alternatives[0].avgPrice : 0
  });
});

// GET medicine categories
router.get('/meta/categories', (req, res) => {
  const categories = [...new Set(medicinesData.map(m => m.category))];
  
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

module.exports = router;
