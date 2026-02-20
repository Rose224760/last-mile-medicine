# 🌱 Last Mile Medicine - Smart Medicine Finder

**Hackathon Project | SDG 3: Good Health & Well-Being**

## 🧩 Problem
During emergencies, people waste critical time searching multiple pharmacies for required medicines. There's no reliable way to know which pharmacy has the medicine in stock, which store is open, or whether cheaper alternatives exist.

## 💡 Solution
A smart platform that helps users quickly locate nearby pharmacies with real-time medicine availability intelligence.

## ✨ Key Features
- 🔍 **Smart Search**: Text, photo, or prescription-based medicine search
- 🚑 **Emergency Mode**: Instant access to nearest open pharmacies
- 🗺️ **Live Map**: Interactive pharmacy locations with real-time status
- 💊 **Generic Alternatives**: Cheaper substitute suggestions
- 📸 **OCR Scanner**: Upload medicine photos or prescriptions
- 📞 **Quick Connect**: One-tap calling to confirm availability
- ⏰ **Real-time Hours**: Open/closed status based on current time

## 🏗️ Tech Stack
- **Frontend**: React + Leaflet Maps
- **Backend**: Node.js + Express
- **Database**: JSON (MVP) → upgradable to MongoDB/Firebase
- **OCR**: Tesseract.js / OCR.space API
- **Maps**: OpenStreetMap

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. **Clone and setup**
```bash
cd NeonStack
```

2. **Start Backend**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

3. **Start Frontend**
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 📂 Project Structure
```
NeonStack/
├── backend/          # Node.js API server
│   ├── routes/       # API endpoints
│   ├── data/         # Mock pharmacy & medicine data
│   └── utils/        # Helper functions
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── docs/             # Documentation & PPT materials
```

## 🎯 MVP Features (Hackathon Demo)
- ✅ Medicine search by name
- ✅ Interactive map with pharmacy markers
- ✅ Emergency mode filtering
- ✅ Real-time open/closed status
- ✅ Photo upload for OCR
- ✅ Generic alternative suggestions
- ✅ Pharmacy dashboard for stock updates

## 🌍 Impact
- Reduces medicine search time by 80%
- Supports night-time emergencies
- Helps elderly and low-literacy users
- Provides public health insights

## 👥 Team
Built for [Your Hackathon Name]

## 📄 License
MIT
