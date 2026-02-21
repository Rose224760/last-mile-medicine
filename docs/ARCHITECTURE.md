# Architecture — Last Mile Medicine

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                              │
│                                                                    │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │  React SPA   │   │  Pharmacy    │   │  Admin Dashboard     │   │
│  │  (User App)  │   │  Dashboard   │   │  (admin-dashboard)   │   │
│  │  Port 3000   │   │  (HTML+JS)   │   │  (HTML+JS)           │   │
│  └──────┬───────┘   └──────┬───────┘   └──────────┬───────────┘   │
│         │                  │                      │               │
│         └──────────────────┼──────────────────────┘               │
│                            │  HTTP / REST                         │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Express)                         │
│                         Port 5000                                  │
│                                                                    │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ │
│  │ /api/medicines │ │ /api/pharmacies│ │ /api/ocr               │ │
│  │                │ │                │ │                        │ │
│  │ • Search       │ │ • List nearby  │ │ • Image upload         │ │
│  │ • Alternatives │ │ • Stock update │ │ • Text extraction      │ │
│  │ • Safety check │ │ • Toggle stock │ │ • Medicine detection   │ │
│  │ • Interaction  │ │ • Get details  │ │                        │ │
│  │ • Admin CRUD   │ │ • Update info  │ │                        │ │
│  └───────┬────────┘ └───────┬────────┘ └───────────┬────────────┘ │
│          │                  │                      │              │
└──────────┼──────────────────┼──────────────────────┼──────────────┘
           │                  │                      │
           ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ medicines.json│  │pharmacies.json│  │  interactions.json      │  │
│  │ (drug catalog)│  │(store catalog)│  │  (drug-drug warnings)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│         MVP: JSON flat files  →  Production: MongoDB / PostgreSQL   │
└─────────────────────────────────────────────────────────────────────┘

External Services:
  • OpenStreetMap / Leaflet  — Interactive maps & geocoding
  • OCR.space API           — Prescription image-to-text
```

## Data Flow

```
User searches "Paracetamol"
       │
       ▼
  SearchBar component  ──►  GET /api/medicines/search?q=paracetamol
                                     │
                                     ▼
                              Fuzzy match against medicines.json
                                     │
                                     ▼
                            Return matching medicines
       │
       ▼
  App.js handleSearch()  ──►  GET /api/pharmacies/nearby?medicine=paracetamol&lat=...&lng=...
                                     │
                                     ▼
                              Haversine distance calculation
                              Open/closed time check
                              Emergency mode scoring
                                     │
                                     ▼
                            Return sorted pharmacy list
       │
       ▼
  PharmacyMap + PharmacyList render results
```

## Key Algorithms

| Algorithm | Location | Purpose |
|-----------|----------|---------|
| Haversine formula | `backend/routes/pharmacies.js` | Calculate distance between user and pharmacies |
| Time-based open/closed | `backend/routes/pharmacies.js` | Determine pharmacy availability |
| Fuzzy medicine search | `backend/routes/medicines.js` | Match names, generics, and brands |
| Emergency scoring | `backend/routes/pharmacies.js` | Rank by `distance × 0.7 + reliability × 0.3` |
| Safety engine | `backend/routes/medicines.js` | Check allergies, age, pregnancy, conditions |
| Drug interaction checker | `backend/routes/medicines.js` | Pairwise interaction lookup |

## Folder Structure

```
NeonStack/
├── package.json            # Root workspace config
├── README.md               # Project documentation
├── LICENSE                  # MIT license
├── .gitignore              # Git ignore rules
├── index.html              # Role-selection portal
├── pharmacy-dashboard.html # Pharmacy owner dashboard
├── admin-dashboard.html    # Admin management panel
│
├── backend/                # Express API server
│   ├── server.js           # Entry point, middleware, static serving
│   ├── package.json        # Backend dependencies
│   ├── routes/
│   │   ├── medicines.js    # Medicine search, safety, interactions, CRUD
│   │   ├── pharmacies.js   # Nearby search, stock management
│   │   └── ocr.js          # Prescription image scanning
│   └── data/
│       ├── medicines.json  # Drug catalog with safety metadata
│       ├── pharmacies.json # Pharmacy locations and stock
│       └── interactions.json # Drug-drug interaction rules
│
├── frontend/               # React single-page application
│   ├── package.json        # Frontend dependencies
│   ├── public/             # Static assets & HTML shell
│   └── src/
│       ├── App.js          # Main app component & routing logic
│       ├── App.css         # Global styles
│       ├── index.js        # React entry point
│       └── components/
│           ├── SearchBar.js        # Medicine search input
│           ├── PharmacyMap.js      # Leaflet map with markers
│           ├── PharmacyList.js     # Pharmacy result cards
│           ├── EmergencyMode.js    # Emergency toggle
│           ├── ElderMode.js        # Accessibility mode
│           ├── PhotoUpload.js      # Prescription scanner
│           ├── HealthProfile.js    # User health profile
│           ├── MedicineDetail.js   # Medicine info + safety
│           ├── DrugInteraction.js  # Interaction checker
│           └── UserDashboard.js    # Dashboard & history
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md     # This file
    ├── FAQ.md              # Frequently asked questions
    ├── PITCH_SCRIPT.md     # Hackathon pitch script
    └── screenshots/        # App screenshots
```
