/**
 * Last Mile Medicine — Backend API Server
 * 
 * Express server that exposes REST endpoints for medicine search,
 * pharmacy lookup, stock management, and prescription OCR scanning.
 * Also serves the static role-portal, pharmacy dashboard, and admin panel.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());                              // Allow cross-origin requests (React dev server)
app.use(express.json());                      // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Serve static HTML dashboards (pharmacy + admin) from the project root
app.use(express.static(path.join(__dirname, '..')));

// ── Route Modules ────────────────────────────────────────────────────
const pharmacyRoutes = require('./routes/pharmacies');
const medicineRoutes = require('./routes/medicines');
const ocrRoutes = require('./routes/ocr');

app.use('/api/pharmacies', pharmacyRoutes); // Pharmacy search & stock management
app.use('/api/medicines', medicineRoutes);  // Medicine catalog, safety, interactions
app.use('/api/ocr', ocrRoutes);             // Prescription image scanning

// ── Health Check ─────────────────────────────────────────────────────
// Simple endpoint to verify the API is running (useful for monitoring)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Last Mile Medicine API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint — serve the role-selection portal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Global Error Handler ─────────────────────────────────────────────
// Catches unhandled errors from any route and returns a JSON response
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// ── Start Server ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
