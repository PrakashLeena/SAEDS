# Connection Test Guide

## Quick Diagnosis Tool

I've created a diagnostic tool to help you test the connection between your frontend and backend on Vercel.

## How to Use

### Method 1: Browser Console (Easiest)

1. Open your deployed frontend URL in a browser
2. Open the browser console (F12 → Console tab)
3. Run one of these commands:

```javascript
// Run all tests
testConnection()

// Test backend connection only
testBackend()

// Test all API endpoints
testEndpoints()

// Print setup guide
connectionGuide()
```

### Method 2: Add to Your App Temporarily

Add this to `src/App.js`:

```javascript
import { useEffect } from 'react';
import { runAllTests } from './utils/connectionTest';

function App() {
  useEffect(() => {
    // Run connection tests on app load
    runAllTests();
  }, []);
  
  // ... rest of your App component
}
```

## What the Tests Check

### ✅ Environment Variables
- Verifies all required environment variables are set
- Shows which ones are missing

### ✅ Backend Connection
- Tests if backend is reachable
- Checks the `/api/health` endpoint
- Shows response data

### ✅ API Endpoints
- Tests multiple API endpoints
- Shows which ones are working
- Identifies failed endpoints

### ✅ Configuration Guide
- Prints setup instructions
- Shows required environment variables
- Links to detailed documentation

## Expected Output

### ✅ Success (Everything Working)
```
🚀 SAEDS Connection Diagnostic Tool
═══════════════════════════════════════════════════

📋 Environment Variables Check:
REACT_APP_API_URL: ✅ Set
REACT_APP_FIREBASE_API_KEY: ✅ Set
... (all green checkmarks)

🏥 Testing Backend Health Endpoint...
✅ Backend is reachable!
📦 Response: {status: "OK", message: "SAEDS Backend Server is running"}
🎉 Connection test PASSED!

🧪 Testing API Endpoints...
✅ Health: 200 OK
✅ Stats: 200 OK
✅ Books: 200 OK
✅ Activities: 200 OK
🎉 All endpoints are working!
```

### ❌ Failure (Connection Issues)
```
🚀 SAEDS Connection Diagnostic Tool
═══════════════════════════════════════════════════

📋 Environment Variables Check:
REACT_APP_API_URL: ❌ Missing
REACT_APP_FIREBASE_API_KEY: ✅ Set
...

🏥 Testing Backend Health Endpoint...
❌ Failed to connect to backend!
🔴 Error: Failed to fetch

💡 Possible causes:
   1. REACT_APP_API_URL is not set or incorrect
   2. Backend is not deployed or not running
   3. CORS is blocking the request
   4. Network connectivity issue

🔧 To fix:
   1. Check Vercel environment variables
   2. Verify backend URL is correct
   3. Check backend FRONTEND_URL setting
   4. Redeploy after changing environment variables
```

## Common Issues & Solutions

### Issue: "REACT_APP_API_URL: ❌ Missing"

**Solution:**
1. Go to Frontend Vercel Project → Settings → Environment Variables
2. Add `REACT_APP_API_URL=https://your-backend.vercel.app/api`
3. Redeploy frontend

### Issue: "Failed to fetch" or "Network Error"

**Solution:**
1. Verify backend is deployed and running
2. Test backend URL directly: `https://your-backend.vercel.app/api/health`
3. Check backend Vercel logs for errors

### Issue: "CORS policy" error

**Solution:**
1. Go to Backend Vercel Project → Settings → Environment Variables
2. Update `FRONTEND_URL=https://your-frontend.vercel.app`
3. Redeploy backend

### Issue: "404 Not Found" on API calls

**Solution:**
1. Backend routing configuration is incorrect
2. Apply the fix in `VERCEL_CONNECTION_FIX.md`
3. Commit and redeploy backend

## Step-by-Step Fix Process

### 1. Run the Diagnostic
```javascript
testConnection()
```

### 2. Identify Issues
Look for ❌ red X marks in the output

### 3. Fix Environment Variables

**Frontend (if any REACT_APP_* are missing):**
- Go to Vercel → Frontend Project → Settings → Environment Variables
- Add missing variables
- Redeploy

**Backend (if connection fails):**
- Go to Vercel → Backend Project → Settings → Environment Variables
- Verify `FRONTEND_URL` is set correctly
- Redeploy

### 4. Test Backend Directly

Open in browser:
```
https://your-backend.vercel.app/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "SAEDS Backend Server is running",
  "timestamp": "..."
}
```

### 5. Re-run Diagnostic
```javascript
testConnection()
```

All tests should pass ✅

## Files to Check

### Frontend
- ✅ `frontend/vercel.json` - Routing configuration
- ✅ `frontend/src/services/api.js` - API URL configuration
- ✅ `frontend/.env.local` - Local environment variables
- ✅ Vercel Environment Variables - Production settings

### Backend
- ✅ `backend/vercel.json` - Serverless routing (FIXED)
- ✅ `backend/api/index.js` - Serverless entry point
- ✅ `backend/app.js` - CORS configuration
- ✅ Vercel Environment Variables - Production settings

## Deployment Checklist

Before deploying, ensure:

### Backend
- [ ] `backend/vercel.json` has correct routing (see VERCEL_CONNECTION_FIX.md)
- [ ] Environment variables set in Vercel:
  - [ ] `MONGODB_URI`
  - [ ] `FRONTEND_URL` (your frontend Vercel URL)
  - [ ] `NODE_ENV=production`
  - [ ] Cloudinary variables
  - [ ] Email variables
- [ ] Backend deployed successfully
- [ ] Backend health endpoint accessible

### Frontend
- [ ] Environment variables set in Vercel:
  - [ ] `REACT_APP_API_URL` (your backend URL + `/api`)
  - [ ] All `REACT_APP_FIREBASE_*` variables (8 total)
- [ ] Frontend deployed successfully
- [ ] No build errors

### Firebase
- [ ] Frontend Vercel domain added to Authorized Domains
- [ ] Firebase Console → Authentication → Settings → Authorized domains

### Cross-References
- [ ] Backend `FRONTEND_URL` matches frontend URL
- [ ] Frontend `REACT_APP_API_URL` matches backend URL + `/api`

## Quick Test Commands

### Test from Browser Console
```javascript
// Full diagnostic
testConnection()

// Quick backend check
fetch(process.env.REACT_APP_API_URL + '/health')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d))
  .catch(e => console.error('❌ Failed:', e))

// Check environment variables
console.log('API URL:', process.env.REACT_APP_API_URL)
```

### Test from Terminal (Backend)
```bash
# Test backend health endpoint
curl https://your-backend.vercel.app/api/health

# Expected output:
# {"status":"OK","message":"SAEDS Backend Server is running","timestamp":"..."}
```

## Documentation References

- **VERCEL_CONNECTION_FIX.md** - Complete connection fix guide
- **VERCEL_FIREBASE_FIX.md** - Firebase configuration fix
- **VERCEL_DEPLOYMENT_CHECKLIST.md** - Deployment checklist
- **VERCEL_DEPLOYMENT_GUIDE.md** - Original deployment guide

## Support

If tests still fail after following all steps:

1. Check Vercel deployment logs (both frontend and backend)
2. Check browser console for specific error messages
3. Verify all URLs are correct (no typos, no trailing slashes)
4. Try deploying in incognito mode (to avoid cache issues)
5. Review the detailed guides in the documentation files

---

**Last Updated:** October 29, 2025
**Status:** ✅ Diagnostic tool ready
