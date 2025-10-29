# Start Local Development - Complete Guide

## 🔍 Current Status

**Backend:** ❌ Not running (port 5000 is free)
**Frontend:** ❌ Not running (port 3000 is free)

Your frontend cannot connect to the backend because **the backend is not running**.

---

## 🚀 Quick Start (Local Development)

### Step 1: Start Backend Server

Open a terminal and run:

```bash
cd "e:\saeds website\backend"
npm start
```

**Expected output:**
```
🚀 Server running on port 5000
🌍 Environment: development
🔗 Frontend URL: http://localhost:3000
✅ MongoDB connected successfully
```

**If you see errors:**
- Check if MongoDB is running
- Verify `.env` file exists in backend folder
- Check `MONGODB_URI` in backend `.env`

### Step 2: Start Frontend Server

Open a **NEW terminal** (keep backend running) and run:

```bash
cd "e:\saeds website\frontend"
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view my-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Browser should automatically open to:** http://localhost:3000

---

## ✅ Verify Connection

### Method 1: Browser Console
1. Open http://localhost:3000
2. Press F12 to open console
3. Run:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Backend error:', e))
```

### Method 2: Direct Backend Test
Open in browser: http://localhost:5000/api/health

Should return:
```json
{
  "status": "OK",
  "message": "SAEDS Backend Server is running",
  "timestamp": "2025-10-29T..."
}
```

---

## 📋 Environment Variables Check

### Backend (.env file location: `backend/.env`)

Required variables:
```env
MONGODB_URI=mongodb://localhost:27017/saeds-db
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=ds2z0fox9
CLOUDINARY_API_KEY=128966933841541
CLOUDINARY_API_SECRET=SgEU1B33BQOPwfrjOw--MWLdFc4

EMAIL_SERVICE=gmail
EMAIL_USER=saedsmail2025@gmail.com
EMAIL_PASSWORD=kpyjjytladjgqjxb
CONTACT_EMAIL=saedsmail2025@gmail.com
```

### Frontend (.env.local file location: `frontend/.env.local`)

Required variables:
```env
REACT_APP_API_URL=http://localhost:5000/api

REACT_APP_FIREBASE_API_KEY=AIzaSyAAq5pyl5oTxYZpiYKesH0HTeyph66sSCk
REACT_APP_FIREBASE_AUTH_DOMAIN=saeds-c04b1.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saeds-c04b1
REACT_APP_FIREBASE_STORAGE_BUCKET=saeds-c04b1.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=190411788882
REACT_APP_FIREBASE_APP_ID=1:190411788882:web:541f6f42d4552a1456858b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ZHLVKFDBHF
```

---

## 🐛 Troubleshooting

### Problem: Backend won't start

#### Error: "MONGODB_URI is not defined"
**Fix:**
1. Check if `backend/.env` file exists
2. Copy from `backend/.env.example` if needed
3. Verify `MONGODB_URI` is set

#### Error: "MongoDB connection failed"
**Fix:**
1. Check if MongoDB is installed and running
2. Run: `mongod --version` to verify installation
3. Start MongoDB service if needed

#### Error: "Port 5000 is already in use"
**Fix:**
1. Find process using port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```
2. Kill the process or use a different port

### Problem: Frontend won't start

#### Error: "npm: command not found"
**Fix:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal after installation

#### Error: "Port 3000 is already in use"
**Fix:**
- Press `Y` when asked to use a different port
- Or kill the process using port 3000

### Problem: Frontend loads but shows errors

#### Error: "Failed to fetch" or "Network Error"
**Cause:** Backend is not running

**Fix:**
1. Check if backend is running on port 5000
2. Open http://localhost:5000/api/health in browser
3. If it doesn't load, restart backend

#### Error: "CORS policy" error
**Cause:** Backend CORS not configured

**Fix:**
1. Check `FRONTEND_URL` in backend `.env`
2. Should be: `http://localhost:3000`
3. Restart backend after changing

---

## 🎯 Complete Startup Checklist

### Before Starting
- [ ] MongoDB is installed and running
- [ ] Node.js is installed (v14 or higher)
- [ ] `backend/.env` file exists with all variables
- [ ] `frontend/.env.local` file exists with all variables
- [ ] Dependencies installed (`npm install` in both folders)

### Starting Development
- [ ] Terminal 1: Backend running on port 5000
- [ ] Terminal 2: Frontend running on port 3000
- [ ] Backend health check works: http://localhost:5000/api/health
- [ ] Frontend loads: http://localhost:3000
- [ ] No CORS errors in browser console

---

## 🔄 Restart Servers

### If you need to restart:

**Backend:**
1. Press `Ctrl+C` in backend terminal
2. Run `npm start` again

**Frontend:**
1. Press `Ctrl+C` in frontend terminal
2. Run `npm start` again

---

## 📝 Quick Commands Reference

### Backend Commands
```bash
cd "e:\saeds website\backend"
npm install          # Install dependencies
npm start            # Start server
npm run seed         # Seed sample data
```

### Frontend Commands
```bash
cd "e:\saeds website\frontend"
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production
```

### MongoDB Commands
```bash
mongod --version     # Check MongoDB version
mongo                # Open MongoDB shell
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Backend terminal shows: "Server running on port 5000"
2. ✅ Frontend terminal shows: "Compiled successfully!"
3. ✅ Browser opens to http://localhost:3000
4. ✅ Homepage loads without errors
5. ✅ Browser console has no red errors
6. ✅ You can navigate to different pages
7. ✅ Sign in/Sign up works
8. ✅ Books page loads data

---

## 🆘 Still Not Working?

### Check Backend Logs
Look at the backend terminal for error messages:
- MongoDB connection errors
- Missing environment variables
- Port conflicts

### Check Frontend Console
Press F12 in browser and check:
- Console tab for JavaScript errors
- Network tab for failed API requests
- Look for CORS errors

### Verify Environment Variables
Run this in frontend browser console:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Firebase API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Missing');
```

### Test Backend Directly
Use curl or browser to test:
```bash
curl http://localhost:5000/api/health
```

---

## 📚 Related Documentation

- **MONGODB_SETUP_COMPLETE.md** - MongoDB setup guide
- **FIREBASE_FIX.md** - Firebase configuration
- **VERCEL_CONNECTION_FIX.md** - For Vercel deployment
- **CONNECTION_TEST_GUIDE.md** - Diagnostic tools

---

## 🎓 Understanding the Setup

### How It Works

1. **Backend (Port 5000):**
   - Express.js server
   - Connects to MongoDB
   - Provides REST API at `/api/*`
   - Handles file uploads via Cloudinary

2. **Frontend (Port 3000):**
   - React application
   - Makes API calls to backend
   - Uses Firebase for authentication
   - Configured via `REACT_APP_API_URL`

3. **Connection:**
   ```
   Frontend (localhost:3000)
        ↓
   API calls to REACT_APP_API_URL
        ↓
   Backend (localhost:5000/api)
        ↓
   MongoDB (localhost:27017)
   ```

### Environment Variables Flow

**Development (Local):**
- Frontend: `REACT_APP_API_URL=http://localhost:5000/api`
- Backend: `FRONTEND_URL=http://localhost:3000`

**Production (Vercel):**
- Frontend: `REACT_APP_API_URL=https://your-backend.vercel.app/api`
- Backend: `FRONTEND_URL=https://your-frontend.vercel.app`

---

**Last Updated:** October 29, 2025
**Status:** ✅ Ready to start local development
