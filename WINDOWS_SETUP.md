# 🚀 Windows Setup Guide - Last Mile Medicine

## Prerequisites Check

Before starting, ensure you have:

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (v18 or higher)
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

### 2. Install Git (Optional)
- Download from: https://git-scm.com/download/win
- Or use GitHub Desktop

---

## Quick Start (2 Terminals Required)

### Step 1: Open PowerShell

**Method 1:** Press `Win + X`, select "Windows PowerShell" or "Terminal"

**Method 2:** Search for "PowerShell" in Start menu

### Step 2: Navigate to Project
```powershell
cd C:\Users\DELL\Desktop\NeonStack
```

---

## Terminal 1: Start Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

**Expected output:**
```
🚀 Server running on http://localhost:5000
📍 Environment: development
```

**Keep this terminal running!**

---

## Terminal 2: Start Frontend

Open a **new PowerShell window**:

```powershell
# Navigate to project
cd C:\Users\DELL\Desktop\NeonStack

# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start the app
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view lastmile-medicine-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser will automatically open to http://localhost:3000

---

## Testing the App

### 1. Search for Medicine
Type "Paracetamol" or "Insulin" in the search bar

### 2. Enable Emergency Mode
Click the "🚑 Emergency Mode" button in the header

### 3. View Pharmacies
- See them on the map (green = open, red = closed)
- Scroll down to see the list view
- Click on markers or cards for details

### 4. Upload Prescription
Click "📸 Upload Prescription" and select an image

### 5. Call or Get Directions
Click the action buttons on pharmacy cards

---

## Common Issues & Solutions

### Issue: "Port 5000 already in use"

**Solution 1:** Find and close the process
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution 2:** Change the port
Edit `backend\.env`:
```
PORT=5001
```

Then update `frontend\.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### Issue: "Port 3000 already in use"

Press `Y` when asked "Would you like to run the app on another port instead?"

Or manually set port:
```powershell
$env:PORT=3001; npm start
```

### Issue: npm install fails

**Solution:** Clear npm cache
```powershell
npm cache clean --force
npm install
```

### Issue: Map not loading

1. Check internet connection (OpenStreetMap requires internet)
2. Allow location access when browser asks
3. Try refreshing the page (Ctrl + F5)

### Issue: CORS errors

Make sure:
1. Backend is running on port 5000
2. Frontend `.env` has correct API URL
3. Both terminals are in the correct folders

---

## File Structure

```
NeonStack/
├── backend/           ← Backend API server
│   ├── data/          ← Pharmacy & medicine data
│   ├── routes/        ← API endpoints
│   ├── .env           ← Backend config
│   └── server.js      ← Main server file
├── frontend/          ← React application
│   ├── public/
│   ├── src/
│   │   ├── components/   ← React components
│   │   ├── App.js        ← Main app
│   │   └── index.js
│   └── .env           ← Frontend config
├── docs/              ← Documentation
├── README.md
└── QUICKSTART.md
```

---

## Stopping the Application

To stop servers:
1. Go to each terminal
2. Press `Ctrl + C`
3. Confirm with `Y` if asked

---

## Restarting Later

Just repeat the terminal commands:

**Terminal 1:**
```powershell
cd C:\Users\DELL\Desktop\NeonStack\backend
npm start
```

**Terminal 2:**
```powershell
cd C:\Users\DELL\Desktop\NeonStack\frontend
npm start
```

(No need to run `npm install` again)

---

## Customization

### Change Default City/Location

Edit `frontend\.env`:
```
REACT_APP_DEFAULT_LAT=your_latitude
REACT_APP_DEFAULT_LNG=your_longitude
```

Example for Mumbai:
```
REACT_APP_DEFAULT_LAT=19.0760
REACT_APP_DEFAULT_LNG=72.8777
```

### Add More Pharmacies

Edit `backend\data\pharmacies.json` - add new entries following the same format

### Add More Medicines

Edit `backend\data\medicines.json` - add new medicines with:
- id
- name
- genericName
- category
- price
- etc.

---

## Demo Tips

1. **Keep both terminals visible** during demo
2. **Open pharmacy-dashboard.html** in browser for pharmacy view
3. **Prepare 2-3 medicine names** to search
4. **Have a prescription image ready** for OCR demo
5. **Test emergency mode toggle** before presenting
6. **Bookmark localhost:3000** for quick access

---

## Troubleshooting Checklist

- [ ] Node.js installed? (`node --version`)
- [ ] npm installed? (`npm --version`)
- [ ] In correct folder? (NeonStack/backend or NeonStack/frontend)
- [ ] Ran `npm install`? (first time)
- [ ] Backend running on port 5000?
- [ ] Frontend running on port 3000?
- [ ] Internet connected? (for maps)
- [ ] Browser: Chrome/Edge recommended
- [ ] JavaScript enabled in browser?

---

## Next Steps

✅ Backend running  
✅ Frontend running  
✅ App opens in browser

Now you're ready to:
1. Test all features
2. Customize data
3. Practice your demo
4. Read PITCH_SCRIPT.md
5. Check FAQ.md for Q&A prep

---

## Support

**Issues during setup?**
1. Check error messages in terminals
2. Verify file paths
3. Ensure Node.js version is 16+
4. Try restarting PowerShell
5. Restart computer if needed

**Demo day checklist:**
- [ ] Tested on presentation laptop
- [ ] Both servers start successfully
- [ ] All features working
- [ ] Map loads correctly
- [ ] Search returns results
- [ ] Emergency mode works
- [ ] Photo upload works
- [ ] Pharmacy dashboard opens

---

Good luck with your hackathon! 🎉
