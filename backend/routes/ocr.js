/**
 * OCR Route — /api/ocr
 * 
 * Handles prescription image uploads, runs text extraction (OCR),
 * and detects medicine names from the extracted text using a
 * keyword-matching approach against a known medicine dictionary.
 * 
 * MVP uses a mock OCR response; production integrates OCR.space API.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');   // Middleware for handling multipart/form-data (file uploads)
const axios = require('axios');     // HTTP client for external OCR API calls

// Configure multer: store uploads in memory (Buffer), limit to 5 MB, images only
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Dictionary of common medicine names used for keyword extraction from OCR text
const commonMedicines = [
  'paracetamol', 'dolo', 'crocin', 'amoxicillin', 'azithromycin',
  'insulin', 'metformin', 'aspirin', 'cetirizine', 'omeprazole',
  'ibuprofen', 'atorvastatin', 'vitamin', 'calpol', 'disprin'
];

/**
 * Scan OCR-extracted text for known medicine names, dosage patterns,
 * and capitalized words (which often indicate drug brands).
 */
function extractMedicineNames(text) {
  const lowerText = text.toLowerCase();
  const found = [];
  
  commonMedicines.forEach(medicine => {
    if (lowerText.includes(medicine)) {
      found.push(medicine);
    }
  });
  
  // Also look for patterns like "500mg", "650mg" etc. (common dosages)
  const dosagePattern = /(\d+)mg/gi;
  const matches = text.match(dosagePattern);
  
  // Look for capitalized words (often medicine names)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
  
  return {
    medicines: [...new Set(found)],
    dosages: matches || [],
    possibleNames: capitalizedWords.slice(0, 5) // First 5 capitalized words
  };
}

// POST - Scan image for medicine names
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }
    
    // For demo purposes, we'll use a simple mock OCR
    // In production, you'd use OCR.space API or Google Vision API
    
    // Mock OCR response (in real app, call OCR API here)
    const mockOcrText = `
      Prescription
      Date: 20/02/2026
      
      Patient: John Doe
      
      Medications:
      1. Paracetamol 650mg - 1 tablet twice daily
      2. Amoxicillin 500mg - 1 capsule thrice daily
      3. Vitamin D - 1 tablet daily
      
      Dr. Sarah Smith
    `;
    
    // For production, use this with OCR.space API:
    /*
    const formData = new FormData();
    formData.append('base64Image', `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
    formData.append('apikey', process.env.OCR_API_KEY);
    
    const ocrResponse = await axios.post('https://api.ocr.space/parse/image', formData);
    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;
    */
    
    // Extract medicine names
    const extracted = extractMedicineNames(mockOcrText);
    
    res.json({
      success: true,
      message: 'Image processed successfully',
      data: {
        rawText: mockOcrText.trim(),
        extracted: extracted,
        timestamp: new Date().toISOString()
      },
      demo: true // Remove in production
    });
    
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process image',
      message: error.message
    });
  }
});

// POST - Extract from text (for testing without image)
router.post('/extract', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Text is required'
    });
  }
  
  const extracted = extractMedicineNames(text);
  
  res.json({
    success: true,
    data: extracted
  });
});

module.exports = router;
