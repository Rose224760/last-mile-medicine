# 🚀 Quick Start Guide

## For Hackathon Demo

### Step 1: Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### Step 2: Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```
Frontend runs on: http://localhost:3000

### Step 3: Test the App

1. Open http://localhost:3000 in your browser
2. Search for "Paracetamol" or "Insulin"
3. View pharmacies on the map
4. Toggle Emergency Mode
5. Upload a prescription image
6. Click call/directions buttons

---

## Features Included ✨

### 1. Smart Medicine Search
- Type medicine name with autocomplete
- Shows generic names and pricing
- Real-time suggestions

### 2. Interactive Map
- See all pharmacies in 10km radius
- Color-coded markers (green=open, red=closed)
- One-tap directions via Google Maps

### 3. Emergency Mode 🚑
- Filters ONLY open pharmacies
- Sorts by distance + reliability
- Highlights 24-hour stores

### 4. Prescription Scanner 📸
- Upload prescription/medicine photo
- Extracts medicine names (demo mode uses mock OCR)
- Auto-searches detected medicines

### 5. Pharmacy Details
- Open/closed status with exact hours
- Delivery availability
- Reliability score
- Distance calculation
- One-tap calling

### 6. Generic Alternatives 💊
- Shows cheaper generic options
- Displays price savings
- Same composition guarantee

---

## Demo Data Included

**6 Pharmacies** in Bangalore area:
- Apollo Pharmacy (Koramangala)
- MedPlus (Indiranagar)
- Wellness Forever (Jayanagar) - 24/7
- NetMeds Store (HSR Layout)
- HealthBuddy Pharmacy (Whitefield)
- City Care 24x7 (Electronic City) - 24/7

**14 Medicines**:
- Paracetamol, Dolo-650, Crocin
- Insulin, Metformin (Diabetes)
- Amoxicillin, Azithromycin (Antibiotics)
- Vitamins, Pain relievers, etc.

---

## API Endpoints

### Pharmacies
- `GET /api/pharmacies` - All pharmacies
- `GET /api/pharmacies/nearby?lat=12.97&lng=77.59&medicine=insulin&emergency=true`
- `GET /api/pharmacies/:id` - Single pharmacy
- `POST /api/pharmacies/:id/stock` - Update stock

### Medicines
- `GET /api/medicines` - All medicines
- `GET /api/medicines/search?q=para` - Search medicines
- `GET /api/medicines/:id/alternatives` - Get generic alternatives

### OCR
- `POST /api/ocr/scan` - Upload prescription image
- `POST /api/ocr/extract` - Extract from text

---

## Customization Tips

### Change Default Location
Edit `frontend/.env`:
```
REACT_APP_DEFAULT_LAT=your_latitude
REACT_APP_DEFAULT_LNG=your_longitude
```

### Add More Pharmacies
Edit `backend/data/pharmacies.json` - add new entries

### Add More Medicines
Edit `backend/data/medicines.json` - add new medicines

### Enable Real OCR
1. Get free API key from https://ocr.space
2. Add to `backend/.env`: `OCR_API_KEY=your_key`
3. Uncomment OCR API code in `backend/routes/ocr.js`

---

## Troubleshooting

**Port already in use?**
```powershell
# Change backend port in backend/.env
PORT=5001
```

**Map not loading?**
- Check internet connection (needs OpenStreetMap tiles)
- Allow location access in browser

**CORS errors?**
- Make sure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend/.env

---

## For Judges/Demo

**Best Demo Flow:**
1. Show emergency mode toggle
2. Search "Insulin" → show open pharmacies only
3. Click pharmacy card → show details
4. Upload prescription → auto-detect medicines
5. Show map with markers
6. Click "Call" or "Directions" buttons

---

## Future Enhancements (Mentioned in Pitch)

- [ ] SMS search for low-connectivity areas
- [ ] Voice search for elderly users
- [ ] Medicine reservation system
- [ ] Pharmacy dashboard mobile app
- [ ] Integration with hospital systems
- [ ] Demand heatmap analytics
- [ ] WhatsApp bot integration

---

## Tech Stack Summary

**Frontend**: React 18, Leaflet Maps, React Icons
**Backend**: Node.js, Express
**Data**: JSON files (easy migration to MongoDB/Firebase)
**APIs**: OCR.space (optional), OpenStreetMap

---

**Built for SDG 3: Good Health & Well-Being** 🌍

Good luck with your hackathon! 🚀
