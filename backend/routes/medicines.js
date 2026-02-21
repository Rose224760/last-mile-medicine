/**
 * Medicines Route — /api/medicines
 * 
 * Provides medicine search (fuzzy by name/generic/brand), generic
 * alternatives with savings, a personal safety engine (allergy, age,
 * pregnancy, condition checks), drug-drug interaction detection,
 * and admin CRUD operations for the medicine catalog.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load medicine catalog and interaction rules from JSON flat-files
const dataPath = path.join(__dirname, '..', 'data', 'medicines.json');
const interactionsPath = path.join(__dirname, '..', 'data', 'interactions.json');
let medicinesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let interactionsData = JSON.parse(fs.readFileSync(interactionsPath, 'utf8'));

/** Write current in-memory medicine catalog back to disk */
function persist() {
  fs.writeFileSync(dataPath, JSON.stringify(medicinesData, null, 2), 'utf8');
}

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

// POST safety check — "Is This Safe for Me?" engine
router.post('/safety-check', (req, res) => {
  const { medicineId, medicineName, profile } = req.body;

  // Find medicine by ID or name
  let medicine = null;
  if (medicineId) {
    medicine = medicinesData.find(m => m.id === medicineId);
  } else if (medicineName) {
    medicine = medicinesData.find(m =>
      m.name.toLowerCase() === medicineName.toLowerCase() ||
      m.genericName.toLowerCase() === medicineName.toLowerCase()
    );
  }

  if (!medicine) {
    return res.status(404).json({ success: false, error: 'Medicine not found' });
  }

  const warnings = [];
  let overallStatus = 'safe'; // safe | caution | avoid

  const escalate = (level) => {
    if (level === 'avoid') overallStatus = 'avoid';
    else if (level === 'caution' && overallStatus !== 'avoid') overallStatus = 'caution';
  };

  // 1. Allergy check
  if (profile.allergies && profile.allergies.length > 0 && medicine.allergyTags) {
    const matched = medicine.allergyTags.filter(tag =>
      profile.allergies.includes(tag)
    );
    if (matched.length > 0) {
      const labels = {
        penicillin: 'Penicillin', beta_lactam: 'Beta-Lactam', nsaid: 'NSAIDs',
        aspirin: 'Aspirin', salicylate: 'Salicylate', macrolide: 'Macrolide',
        sulfa: 'Sulfa drugs', statin: 'Statin', ppi: 'PPI'
      };
      warnings.push({
        type: 'allergy',
        level: 'avoid',
        message: `Contains ${matched.map(m => labels[m] || m).join(', ')} — you marked this as an allergy`,
        details: `This medicine belongs to the ${medicine.drugClass} class. Avoid if you have known sensitivity.`
      });
      escalate('avoid');
    }
  }

  // 2. Age check
  if (profile.ageGroup && medicine.ageRestrictions) {
    const ageSafety = medicine.ageRestrictions[profile.ageGroup];
    if (ageSafety && ageSafety !== 'safe') {
      const ageLabels = { child: 'children (under 12)', adult: 'adults', elderly: 'elderly (65+)' };
      warnings.push({
        type: 'age',
        level: ageSafety,
        message: ageSafety === 'avoid'
          ? `Not recommended for ${ageLabels[profile.ageGroup]}`
          : `Use with caution for ${ageLabels[profile.ageGroup]}`,
        details: `Dosage adjustments or medical supervision may be required for this age group.`
      });
      escalate(ageSafety);
    }
  }

  // 3. Pregnancy check
  if (profile.pregnant && medicine.pregnancySafety) {
    if (medicine.pregnancySafety !== 'safe') {
      warnings.push({
        type: 'pregnancy',
        level: medicine.pregnancySafety,
        message: medicine.pregnancySafety === 'avoid'
          ? 'Not recommended during pregnancy'
          : 'Use with caution during pregnancy — consult your doctor',
        details: 'Some medicines can affect fetal development. Always consult a healthcare provider.'
      });
      escalate(medicine.pregnancySafety);
    }
  }

  // 4. Chronic condition checks
  if (profile.conditions && profile.conditions.length > 0 && medicine.conditionWarnings) {
    const condLabels = {
      liver_disease: 'Liver disease', kidney_disease: 'Kidney disease',
      heart_disease: 'Heart disease', asthma: 'Asthma',
      bleeding_disorder: 'Bleeding disorder', hypertension: 'Hypertension',
      diabetes: 'Diabetes'
    };
    for (const cond of profile.conditions) {
      const level = medicine.conditionWarnings[cond];
      if (level) {
        warnings.push({
          type: 'condition',
          level,
          message: level === 'avoid'
            ? `Avoid with ${condLabels[cond] || cond}`
            : `Use with caution — ${condLabels[cond] || cond}`,
          details: `This medicine may interact with or worsen ${(condLabels[cond] || cond).toLowerCase()}.`
        });
        escalate(level);
      }
    }
  }

  // Find safe alternatives if status is avoid
  let alternatives = [];
  if (overallStatus === 'avoid' && medicine.safeAlternatives && medicine.safeAlternatives.length > 0) {
    alternatives = medicine.safeAlternatives.map(altName => {
      const altMed = medicinesData.find(m =>
        m.name.toLowerCase() === altName.toLowerCase()
      );
      return altMed || { name: altName, note: 'Consult your pharmacist' };
    });
  }

  res.json({
    success: true,
    medicine: {
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      composition: medicine.composition,
      drugClass: medicine.drugClass,
      category: medicine.category,
      sideEffects: medicine.sideEffects,
      requiresPrescription: medicine.requiresPrescription,
      pregnancySafety: medicine.pregnancySafety,
      ageRestrictions: medicine.ageRestrictions
    },
    safety: {
      status: overallStatus,
      warnings,
      alternativeCount: alternatives.length,
      alternatives
    },
    disclaimer: 'This is informational support only, not medical advice. Always consult a qualified healthcare professional.'
  });
});

// ─── Admin Medicine Management ────────────────────────────────────────

// POST drug interaction check
router.post('/interaction-check', (req, res) => {
  const { medicines } = req.body; // array of medicine names

  if (!medicines || !Array.isArray(medicines) || medicines.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Provide at least 2 medicine names to check interactions'
    });
  }

  // Normalize names — match by name or genericName
  const resolved = medicines.map(name => {
    const med = medicinesData.find(m =>
      m.name.toLowerCase() === name.toLowerCase() ||
      m.genericName.toLowerCase() === name.toLowerCase()
    );
    return med ? med.name : name;
  });

  // Also collect generic names for matching
  const allNames = medicines.flatMap(name => {
    const med = medicinesData.find(m =>
      m.name.toLowerCase() === name.toLowerCase() ||
      m.genericName.toLowerCase() === name.toLowerCase()
    );
    return med ? [med.name.toLowerCase(), med.genericName.toLowerCase()] : [name.toLowerCase()];
  });

  const foundInteractions = [];

  // Check every pair
  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i].toLowerCase();
      const b = resolved[j].toLowerCase();

      const medA = medicinesData.find(m => m.name.toLowerCase() === a || m.genericName.toLowerCase() === a);
      const medB = medicinesData.find(m => m.name.toLowerCase() === b || m.genericName.toLowerCase() === b);

      const namesA = medA ? [medA.name.toLowerCase(), medA.genericName.toLowerCase()] : [a];
      const namesB = medB ? [medB.name.toLowerCase(), medB.genericName.toLowerCase()] : [b];

      const match = interactionsData.find(int => {
        const d1 = int.drug1.toLowerCase();
        const d2 = int.drug2.toLowerCase();
        return (namesA.includes(d1) && namesB.includes(d2)) ||
               (namesA.includes(d2) && namesB.includes(d1));
      });

      if (match) {
        foundInteractions.push({
          drug1: resolved[i],
          drug2: resolved[j],
          severity: match.severity,
          effect: match.effect,
          detail: match.detail,
          recommendation: match.recommendation
        });
      }
    }
  }

  res.json({
    success: true,
    medicineCount: medicines.length,
    interactionCount: foundInteractions.length,
    interactions: foundInteractions,
    disclaimer: 'This is informational only. Always consult a doctor or pharmacist before combining medications.'
  });
});

// POST - Add a new medicine
router.post('/admin/add', (req, res) => {
  const {
    name, genericName, brandNames, category, commonUses, avgPrice,
    requiresPrescription, composition, drugClass, allergyTags,
    ageRestrictions, pregnancySafety, conditionWarnings, sideEffects, safeAlternatives
  } = req.body;

  if (!name || !genericName || !category) {
    return res.status(400).json({ success: false, error: 'name, genericName, and category are required' });
  }

  // Auto-generate ID
  const maxNum = medicinesData.reduce((max, m) => {
    const n = parseInt(m.id.replace('med', ''), 10);
    return n > max ? n : max;
  }, 0);
  const newId = 'med' + String(maxNum + 1).padStart(3, '0');

  const newMed = {
    id: newId,
    name,
    genericName,
    brandNames: brandNames || [],
    category,
    commonUses: commonUses || [],
    avgPrice: avgPrice || 0,
    requiresPrescription: requiresPrescription || false,
    composition: composition || [],
    drugClass: drugClass || '',
    allergyTags: allergyTags || [],
    ageRestrictions: ageRestrictions || { child: 'safe', adult: 'safe', elderly: 'safe' },
    pregnancySafety: pregnancySafety || 'safe',
    conditionWarnings: conditionWarnings || {},
    sideEffects: sideEffects || [],
    safeAlternatives: safeAlternatives || []
  };

  medicinesData.push(newMed);
  persist();

  res.status(201).json({ success: true, message: 'Medicine added', data: newMed });
});

// PUT - Update an existing medicine
router.put('/admin/:id', (req, res) => {
  const idx = medicinesData.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Medicine not found' });
  }

  const allowed = [
    'name', 'genericName', 'brandNames', 'category', 'commonUses', 'avgPrice',
    'requiresPrescription', 'composition', 'drugClass', 'allergyTags',
    'ageRestrictions', 'pregnancySafety', 'conditionWarnings', 'sideEffects', 'safeAlternatives'
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      medicinesData[idx][key] = req.body[key];
    }
  }

  persist();
  res.json({ success: true, message: 'Medicine updated', data: medicinesData[idx] });
});

// DELETE - Remove a medicine
router.delete('/admin/:id', (req, res) => {
  const idx = medicinesData.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Medicine not found' });
  }

  const removed = medicinesData.splice(idx, 1)[0];
  persist();
  res.json({ success: true, message: 'Medicine removed', data: removed });
});

module.exports = router;
