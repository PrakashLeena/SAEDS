# Frontend-Backend Connection Fix for Vercel

## Problem Identified

Your frontend and backend are not connecting on Vercel due to:

1. **Backend routing configuration issue** - The current `backend/vercel.json` routes ALL requests to `/api/index.js`, but your Express app expects routes starting with `/api/`
2. **CORS configuration** - Backend needs the correct frontend URL
3. **Environment variables** - Frontend needs the correct backend URL
4. **Missing `/api` prefix handling** in serverless deployment

---

## Solution: Fix Backend Vercel Configuration

### Option 1: Update Backend vercel.json (Recommended)

Replace your `backend/vercel.json` with this corrected version:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

**What this fixes:**
- Routes starting with `/api/` are correctly forwarded to your Express app
- All other routes also go to the Express app (which has its own routing)

### Option 2: Modify Backend API Handler

Alternatively, update `backend/api/index.js` to handle the `/api` prefix:

```javascript
// Vercel serverless entrypoint for the backend.
const app = require('../app');

// Export handler for Vercel
module.exports = (req, res) => {
  // Vercel passes the full path, but Express app expects /api prefix
  // If the path doesn't start with /api, prepend it
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  return app(req, res);
};
```

---

## Complete Setup Checklist

### 1. Backend Vercel Project Setup

#### A. Environment Variables
Go to **Backend Vercel Project** → **Settings** → **Environment Variables**

Add these for **Production, Preview, and Development**:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# CORS - CRITICAL!
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production

# Cloudinary
CLOUDINARY_CLOUD_NAME=ds2z0fox9
CLOUDINARY_API_KEY=128966933841541
CLOUDINARY_API_SECRET=SgEU1B33BQOPwfrjOw--MWLdFc4

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=saedsmail2025@gmail.com
EMAIL_PASSWORD=kpyjjytladjgqjxb
CONTACT_EMAIL=saedsmail2025@gmail.com
```

**⚠️ CRITICAL:** Replace `https://your-frontend.vercel.app` with your ACTUAL frontend Vercel URL

#### B. Project Settings
- **Root Directory:** `backend`
- **Framework Preset:** Other
- **Build Command:** (leave empty or use `npm install`)
- **Output Directory:** (leave empty)

#### C. Get Backend URL
After deployment, copy your backend URL. It will look like:
- `https://your-backend-abc123.vercel.app`

---

### 2. Frontend Vercel Project Setup

#### A. Environment Variables
Go to **Frontend Vercel Project** → **Settings** → **Environment Variables**

Add these for **Production, Preview, and Development**:

```env
# Backend API - CRITICAL!
REACT_APP_API_URL=https://your-backend.vercel.app/api

# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyAAq5pyl5oTxYZpiYKesH0HTeyph66sSCk
REACT_APP_FIREBASE_AUTH_DOMAIN=saeds-c04b1.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saeds-c04b1
REACT_APP_FIREBASE_STORAGE_BUCKET=saeds-c04b1.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=190411788882
REACT_APP_FIREBASE_APP_ID=1:190411788882:web:541f6f42d4552a1456858b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ZHLVKFDBHF
```

**⚠️ CRITICAL:** 
- Replace `https://your-backend.vercel.app/api` with your ACTUAL backend URL + `/api`
- Note the `/api` suffix is required!

#### B. Project Settings
- **Root Directory:** `frontend`
- **Framework Preset:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`

#### C. Get Frontend URL
After deployment, copy your frontend URL. It will look like:
- `https://your-frontend-xyz789.vercel.app`

---

### 3. Update Cross-References

After both are deployed:

1. **Update Backend `FRONTEND_URL`:**
   - Go to Backend Vercel → Settings → Environment Variables
   - Update `FRONTEND_URL` to your frontend URL (without `/api`)
   - Redeploy backend

2. **Update Firebase Authorized Domains:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/saeds-c04b1)
   - Navigate to Authentication → Settings → Authorized domains
   - Add your frontend Vercel domain

---

## Testing the Connection

### 1. Test Backend Health Endpoint

Open in browser:
```
https://your-backend.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "SAEDS Backend Server is running",
  "timestamp": "2025-10-29T..."
}
```

**If you get 404:** Backend routing is incorrect (apply Option 1 or 2 above)

### 2. Test Frontend API Connection

1. Open your frontend URL: `https://your-frontend.vercel.app`
2. Open browser console (F12 → Console)
3. Run this command:
   ```javascript
   fetch(process.env.REACT_APP_API_URL + '/health')
     .then(r => r.json())
     .then(d => console.log('✅ Backend connected:', d))
     .catch(e => console.error('❌ Backend error:', e))
   ```

**Expected Output:**
```
✅ Backend connected: {status: "OK", message: "SAEDS Backend Server is running", ...}
```

### 3. Test CORS

1. Open frontend in browser
2. Open Network tab (F12 → Network)
3. Navigate to a page that makes API calls (e.g., Books page)
4. Check API requests

**Expected:**
- Status: 200 OK
- No CORS errors

**If you see CORS errors:**
- Verify `FRONTEND_URL` in backend matches your frontend URL exactly
- Redeploy backend after changing environment variables

---

## Common Connection Errors & Fixes

### Error: "Failed to fetch" or "Network Error"

**Cause:** Frontend can't reach backend URL

**Fix:**
1. Verify `REACT_APP_API_URL` is set correctly in frontend Vercel
2. Test backend health endpoint directly in browser
3. Check backend is deployed and running

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** Backend CORS not allowing frontend domain

**Fix:**
1. Update `FRONTEND_URL` in backend environment variables
2. Ensure it matches your frontend URL exactly (no trailing slash)
3. Redeploy backend

### Error: "404 Not Found" on API calls

**Cause:** Backend routing configuration issue

**Fix:**
1. Apply Option 1 (update `backend/vercel.json`) or Option 2 (update `backend/api/index.js`)
2. Commit and push changes
3. Redeploy backend

### Error: "500 Internal Server Error"

**Cause:** Backend code error or missing environment variables

**Fix:**
1. Check Vercel Function Logs: Backend Project → Deployments → Click deployment → View Function Logs
2. Look for specific error messages
3. Verify all environment variables are set (especially `MONGODB_URI`)

---

## Step-by-Step Deployment Process

### Step 1: Deploy Backend First

```bash
# Make sure backend/vercel.json is correct (Option 1)
cd backend
git add vercel.json
git commit -m "Fix backend Vercel routing"
git push origin main
```

Wait for deployment, then:
1. Go to Vercel Dashboard → Backend Project
2. Copy the deployment URL (e.g., `https://saeds-backend.vercel.app`)

### Step 2: Configure Backend Environment Variables

1. Go to Backend Project → Settings → Environment Variables
2. Set `FRONTEND_URL` (you'll update this after frontend deploys)
3. Set all other backend variables (MongoDB, Cloudinary, Email)
4. Apply to all environments

### Step 3: Deploy Frontend

```bash
cd frontend
git add .
git commit -m "Update configuration"
git push origin main
```

Wait for deployment, then:
1. Go to Vercel Dashboard → Frontend Project
2. Copy the deployment URL (e.g., `https://saeds-frontend.vercel.app`)

### Step 4: Configure Frontend Environment Variables

1. Go to Frontend Project → Settings → Environment Variables
2. Set `REACT_APP_API_URL` to backend URL + `/api`
   - Example: `https://saeds-backend.vercel.app/api`
3. Set all Firebase variables
4. Apply to all environments
5. Redeploy frontend

### Step 5: Update Backend FRONTEND_URL

1. Go to Backend Project → Settings → Environment Variables
2. Update `FRONTEND_URL` to frontend URL (no `/api`)
   - Example: `https://saeds-frontend.vercel.app`
3. Redeploy backend

### Step 6: Configure Firebase

1. Go to Firebase Console
2. Add frontend Vercel domain to Authorized Domains
3. Test authentication

---

## Verification Script

Add this to your frontend temporarily to debug:

```javascript
// Add to src/App.js or any component
useEffect(() => {
  console.log('🔍 Configuration Check:');
  console.log('API URL:', process.env.REACT_APP_API_URL);
  
  // Test backend connection
  fetch(process.env.REACT_APP_API_URL + '/health')
    .then(r => r.json())
    .then(data => {
      console.log('✅ Backend connected successfully!');
      console.log('Backend response:', data);
    })
    .catch(error => {
      console.error('❌ Backend connection failed!');
      console.error('Error:', error.message);
      console.error('Make sure REACT_APP_API_URL is set correctly');
    });
}, []);
```

---

## Quick Reference URLs

### Your Projects
- **Backend Vercel:** [Your backend URL]
- **Frontend Vercel:** [Your frontend URL]
- **Firebase Console:** https://console.firebase.google.com/project/saeds-c04b1

### Environment Variable Format
```
Backend FRONTEND_URL:     https://your-frontend.vercel.app
Frontend REACT_APP_API_URL: https://your-backend.vercel.app/api
```

**Note:** No trailing slashes!

---

## Still Having Issues?

### Check Vercel Logs

**Backend Logs:**
1. Go to Backend Project → Deployments
2. Click latest deployment
3. Click "View Function Logs"
4. Look for errors

**Frontend Build Logs:**
1. Go to Frontend Project → Deployments
2. Click latest deployment
3. Click "View Build Logs"
4. Check for build errors

### Test Locally First

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

If it works locally but not on Vercel, it's definitely an environment variable or configuration issue.

---

## Summary

The main connection issues are:

1. ✅ **Backend routing** - Fixed with updated `vercel.json` or `api/index.js`
2. ✅ **CORS configuration** - Backend `FRONTEND_URL` must match frontend URL
3. ✅ **API URL** - Frontend `REACT_APP_API_URL` must point to backend + `/api`
4. ✅ **Environment variables** - Must be set in Vercel dashboard for each project

After applying these fixes and redeploying both projects, your frontend and backend should connect successfully on Vercel.
