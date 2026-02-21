# 🌱 Last Mile Medicine — Smart Medicine Finder

> **Hackathon Project | SDG 3: Good Health & Well-Being**

People waste **30–60 minutes** during emergencies searching multiple pharmacies for medicines.  
**Last Mile Medicine** instantly shows where your required medicine is actually available nearby — turning medicine search from hours to **seconds**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Leaflet.js, OpenStreetMap |
| **Backend** | Node.js, Express |
| **Data** | JSON flat-files (MVP) → MongoDB / PostgreSQL |
| **OCR** | OCR.space API / Tesseract.js |
| **Maps** | OpenStreetMap + React-Leaflet |
| **Styling** | Custom CSS (responsive, dark-themed) |

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔍 **Smart Search** | Search medicines by name, generic name, or brand — fuzzy matching across the catalog |
| 2 | 🚑 **Emergency Mode** | Filters only **open** pharmacies, prioritizes 24/7 stores, sorts by distance + reliability |
| 3 | 🗺️ **Live Pharmacy Map** | Interactive Leaflet map with color-coded markers (open/closed/24-hr) |
| 4 | 💊 **Generic Alternatives** | Shows cheaper substitutes with savings calculation |
| 5 | 📸 **Prescription Scanner** | Upload a photo — OCR extracts medicine names automatically |
| 6 | 🛡️ **Safety Engine** | Checks allergies, age, pregnancy, and chronic conditions against each medicine |
| 7 | ⚠️ **Drug Interaction Checker** | Pairwise interaction detection with severity levels |
| 8 | 👴 **Elder Mode** | Large text, simplified UI, and emoji-enhanced interface for accessibility |
| 9 | 📊 **Pharmacy Dashboard** | Pharmacy owners can update stock, hours, and delivery status in real-time |
| 10 | 🏥 **Admin Panel** | Full medicine CRUD, pharmacy management, and analytics |

---

## 📸 Screenshots

> **Add your own screenshots** to `docs/screenshots/` and update the paths below.

| Home & Search | Emergency Map | Pharmacy Dashboard |
|:---:|:---:|:---:|
| ![Home](<img width="1836" height="888" alt="Screenshot 2026-02-21 083115" src="https://github.com/user-attachments/assets/25255111-5565-4228-b9db-30537fe2a7d0" />
 | ![Emergency](<img width="805" height="397" alt="image" src="https://github.com/user-attachments/assets/e4a6801b-5e6d-4074-be84-4f09834127c9" />
) |

| Medicine Safety Check | Drug Interaction | Elder Mode |
|:---:|:---:|:---:|
| ![Safety](<img width="920" height="429" alt="image" src="https://github.com/user-attachments/assets/6ca40b09-9e09-4b5c-a47f-babf83f74b5b" />
) |  |

---


## 🏛️ Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                            │
│  React SPA (3000)  │  Pharmacy Dashboard  │  Admin Dashboard  │
└────────────┬─────────────────┬──────────────────┬─────────────┘
             │   REST / JSON   │                  │
             ▼                 ▼                  ▼
┌───────────────────────────────────────────────────────────────┐
│                   EXPRESS API (Port 5000)                      │
│  /api/medicines  │  /api/pharmacies  │  /api/ocr              │
│  search, safety, │  nearby, stock,   │  image scan,           │
│  interactions,   │  toggle, CRUD     │  text extract           │
│  admin CRUD      │                   │                        │
└────────┬─────────────────┬──────────────────┬─────────────────┘
         ▼                 ▼                  ▼
┌───────────────────────────────────────────────────────────────┐
│                       DATA LAYER                              │
│  medicines.json  │  pharmacies.json  │  interactions.json     │
│  (drug catalog)  │  (store catalog)  │  (drug-drug rules)     │
└───────────────────────────────────────────────────────────────┘
         External: OpenStreetMap · OCR.space API
```

> Full architecture details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 16+ — [download](https://nodejs.org/)
- **npm** (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/NeonStack/lastmile-medicine.git
cd NeonStack
```

### 2. Install all dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start the application

```bash
# Terminal 1 — Backend API
cd backend
npm start
# → http://localhost:5000

# Terminal 2 — React Frontend
cd frontend
npm start
# → http://localhost:3000
```

### 4. Open in browser

| Interface | URL |
|-----------|-----|
| User App (React) | `http://localhost:3000` |
| Role Portal | `http://localhost:5000` |
| Pharmacy Dashboard | `http://localhost:5000/pharmacy-dashboard.html` |
| Admin Dashboard | `http://localhost:5000/admin-dashboard.html` |
| API Health Check | `http://localhost:5000/api/health` |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### Medicines

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/medicines` | List all medicines |
| `GET` | `/medicines/search?q=paracetamol` | Search medicines by name/generic/brand |
| `GET` | `/medicines/:id` | Get medicine by ID |
| `GET` | `/medicines/:id/alternatives` | Get generic alternatives with savings |
| `GET` | `/medicines/meta/categories` | List all categories |
| `POST` | `/medicines/safety-check` | Check medicine safety against health profile |
| `POST` | `/medicines/interaction-check` | Check drug-drug interactions |
| `POST` | `/medicines/admin/add` | Add a new medicine (admin) |
| `PUT` | `/medicines/admin/:id` | Update medicine (admin) |
| `DELETE` | `/medicines/admin/:id` | Delete medicine (admin) |

### Pharmacies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pharmacies` | List all pharmacies with open/closed status |
| `GET` | `/pharmacies/nearby?lat=...&lng=...&medicine=...` | Find nearby pharmacies |
| `GET` | `/pharmacies/:id` | Get pharmacy by ID |
| `POST` | `/pharmacies/:id/stock` | Update full stock list |
| `POST` | `/pharmacies/:id/stock/toggle` | Toggle a single medicine in/out of stock |
| `PUT` | `/pharmacies/:id` | Update pharmacy details |

### OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ocr/scan` | Upload prescription image for medicine extraction |
| `POST` | `/ocr/extract` | Extract medicine names from text |

### Example Request

```bash
# Search for a medicine
curl http://localhost:5000/api/medicines/search?q=paracetamol

# Find nearby pharmacies with Paracetamol
curl "http://localhost:5000/api/pharmacies/nearby?lat=10.5276&lng=76.2144&medicine=paracetamol"

# Check drug interactions
curl -X POST http://localhost:5000/api/medicines/interaction-check \
  -H "Content-Type: application/json" \
  -d '{"medicines": ["Aspirin", "Ibuprofen"]}'
```

---

## 📂 Project Structure

```
NeonStack/
├── package.json             # Root workspace configuration
├── README.md                # This file
├── LICENSE                  # MIT license
├── .gitignore               # Git ignore rules
├── index.html               # Role-selection portal
├── pharmacy-dashboard.html  # Pharmacy owner UI
├── admin-dashboard.html     # Admin management UI
│
├── backend/                 # Express API server
│   ├── server.js            # App entry point & middleware
│   ├── package.json
│   ├── routes/
│   │   ├── medicines.js     # Medicine search, safety, interactions
│   │   ├── pharmacies.js    # Pharmacy search & stock management
│   │   └── ocr.js           # Prescription image scanning
│   └── data/
│       ├── medicines.json   # Drug catalog with safety metadata
│       ├── pharmacies.json  # Pharmacy locations & inventory
│       └── interactions.json# Drug-drug interaction rules
│
├── frontend/                # React SPA
│   ├── package.json
│   ├── public/              # Static HTML shell
│   └── src/
│       ├── App.js           # Root component & state management
│       ├── App.css          # Global styles
│       └── components/      # Feature modules (10 components)
│
└── docs/                    # Documentation & diagrams
    ├── ARCHITECTURE.md      # System architecture details
    ├── FAQ.md               # Frequently asked questions
    ├── PITCH_SCRIPT.md      # Hackathon pitch script
    └── screenshots/         # App screenshots
```

---

## 🌍 Impact

- Reduces medicine search time by **80%**
- Supports **night-time** and **rural** emergencies
- Helps **elderly** and **low-literacy** users with Elder Mode
- Provides **generic alternatives** saving 20–40% on costs
- Gives pharmacies **real-time visibility** to nearby customers

---

## 🤖 AI Tools Used

- **GitHub Copilot** (Claude) — Code assistance, feature implementation, debugging, and documentation generation
- **OCR.space API** — Prescription text extraction (production integration)

---

## 👥 Team — NeonStack

| Name | Role |
|------|------|
| **Rose Mary** | Developer |
| **Selma Mary Paul** | Developer |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Last Mile Medicine</strong> · SDG 3: Good Health & Well-Being<br>
  Making healthcare accessible, one search at a time.
</p>
