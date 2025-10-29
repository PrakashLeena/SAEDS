# Vercel Deployment Troubleshooting Guide

## ✅ Critical Fix Applied

**Issue Found**: The `backend/vercel.json` had conflicting CORS headers that were overriding the dynamic CORS configuration in your code.

**What Was Fixed**:
- Removed static CORS headers from `backend/vercel.json`
- Now CORS is handled dynamically by `app.js` and `api/index.js`
- This allows preview deployments to work correctly

**Commit**: `d7331aa - Fix: Remove conflicting CORS headers from vercel.json`

---

## Current Status

✅ **Code pushed to GitHub**: Commit `d7331aa`  
⏳ **Vercel auto-deployment**: Should trigger in 1-2 minutes  
🎯 **Expected result**: CORS errors will disappear after deployment

---

## What to Do Now

### Step 1: Wait for Vercel Deployment (2-3 minutes)

1. Go to https://vercel.com/dashboard
2. Click your **backend project**
3. Go to **Deployments** tab
4. Wait for the latest deployment to show **"Ready"** status
5. Look for commit message: "Fix: Remove conflicting CORS headers from vercel.json"

### Step 2: Verify Backend is Working

After deployment shows "Ready", test the backend:

**Open in browser:**
```
https://saeds.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "OK",
  "message": "SAEDS Backend Server is running",
  "timestamp": "2025-10-29T..."
}
```

### Step 3: Test CORS from Frontend

**Open your frontend preview URL:**
```
https://saeds-klj8-hhojtdw6u-a-g-prakash-leenas-projects.vercel.app
```

**Open browser console (F12) and run:**
```javascript
fetch('https://saeds.vercel.app/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS working:', d))
  .catch(e => console.error('❌ Error:', e))
```

**Expected**: No CORS errors, successful response

---

## If Deployment Still Doesn't Work

### Check 1: Verify Environment Variables Are Set

**Backend Environment Variables** (in Vercel dashboard):
```
FRONTEND_URL=https://saeds-klj8.vercel.app
MONGODB_URI=mongodb+srv://saedsmail2025:Saeds2025@cluster0.ave1khj.mongodb.net/saeds?appName=Cluster0
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CLOUDINARY_CLOUD_NAME=ds2z0fox9
CLOUDINARY_API_KEY=128966933841541
CLOUDINARY_API_SECRET=SgEU1B33BQOPwfrjOw--MWLdFc4
EMAIL_SERVICE=gmail
EMAIL_USER=saedsmail2025@gmail.com
EMAIL_PASSWORD=kpyjjytladjgqjxb
CONTACT_EMAIL=saedsmail2025@gmail.com
```

**Frontend Environment Variables** (in Vercel dashboard):
```
REACT_APP_API_URL=https://saeds.vercel.app/api
REACT_APP_FIREBASE_API_KEY=AIzaSyAAq5pyl5oTxYZpiYKesH0HTeyph66sSCk
REACT_APP_FIREBASE_AUTH_DOMAIN=saeds-c04b1.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saeds-c04b1
REACT_APP_FIREBASE_STORAGE_BUCKET=saeds-c04b1.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=190411788882
REACT_APP_FIREBASE_APP_ID=1:190411788882:web:541f6f42d4552a1456858b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ZHLVKFDBHF
```

**How to set**:
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Enter Key and Value
5. Check **Production**, **Preview**, **Development**
6. Click **Save**
7. **Redeploy** after adding all variables

### Check 2: Verify Vercel Project Settings

**Backend Project Settings**:
- **Root Directory**: `backend` (or leave empty if backend is at root)
- **Framework Preset**: Other
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

**Frontend Project Settings**:
- **Root Directory**: `frontend` (or leave empty if frontend is at root)
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Check 3: Manual Redeploy

If automatic deployment doesn't trigger:

1. Go to Vercel Dashboard → Backend Project
2. Click **Deployments**
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for completion

Do the same for frontend project.

---

## Common Errors and Solutions

### Error: "CORS policy: Response to preflight request doesn't pass access control check"

**Cause**: Backend CORS not allowing frontend origin

**Solution**:
1. ✅ Already fixed by removing conflicting headers from `vercel.json`
2. Wait for backend to redeploy
3. If still failing, check environment variables are set

### Error: "Failed to fetch" or "net::ERR_FAILED"

**Cause**: Backend not reachable or environment variables missing

**Solution**:
1. Test backend health endpoint: `https://saeds.vercel.app/api/health`
2. If 404, check Vercel routing configuration
3. If 500, check Vercel function logs for errors
4. Verify `MONGODB_URI` is set correctly

### Error: "404 Not Found" on API calls

**Cause**: Incorrect API URL or routing issue

**Solution**:
1. Verify `REACT_APP_API_URL` includes `/api` suffix
2. Check backend `vercel.json` routing configuration
3. Test individual endpoints in browser

### Error: "500 Internal Server Error"

**Cause**: Backend code error or missing environment variables

**Solution**:
1. Check Vercel Function Logs:
   - Backend Project → Deployments → Click deployment → View Function Logs
2. Look for error messages
3. Common causes:
   - Missing `MONGODB_URI`
   - Invalid MongoDB connection string
   - Missing Cloudinary credentials

---

## Vercel Deployment Architecture

### How Your Projects Are Structured

```
GitHub Repository: PrakashLeena/SAEDS
│
├── backend/
│   ├── api/
│   │   └── index.js          ← Vercel serverless entry point
│   ├── app.js                ← Express app with CORS
│   ├── vercel.json           ← Vercel configuration (FIXED)
│   └── package.json
│
└── frontend/
    ├── src/
    ├── public/
    ├── vercel.json           ← Vercel configuration
    └── package.json
```

### Vercel Projects

You should have **TWO separate Vercel projects**:

1. **Backend Project** (e.g., "saeds-backend")
   - Deploys from `backend/` directory
   - URL: `https://saeds.vercel.app`
   - Runs serverless functions

2. **Frontend Project** (e.g., "saeds-klj8")
   - Deploys from `frontend/` directory
   - URL: `https://saeds-klj8.vercel.app`
   - Serves static React build

### How They Connect

```
Frontend (saeds-klj8.vercel.app)
    ↓
    Makes API calls to
    ↓
Backend (saeds.vercel.app/api)
    ↓
    Connects to
    ↓
MongoDB Atlas
```

---

## Deployment Checklist

Use this checklist to ensure everything is configured correctly:

### Backend Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked to repository
- [ ] Root directory set to `backend` (if needed)
- [ ] All environment variables set in Vercel dashboard
- [ ] Deployment shows "Ready" status
- [ ] Health endpoint returns 200 OK: `https://saeds.vercel.app/api/health`
- [ ] No errors in Vercel function logs

### Frontend Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked to repository
- [ ] Root directory set to `frontend` (if needed)
- [ ] `REACT_APP_API_URL` set to `https://saeds.vercel.app/api`
- [ ] All Firebase environment variables set
- [ ] Deployment shows "Ready" status
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] API calls work correctly

### Cross-Project Configuration
- [ ] Backend `FRONTEND_URL` matches frontend production URL
- [ ] Frontend `REACT_APP_API_URL` matches backend URL + `/api`
- [ ] Firebase authorized domains include frontend Vercel domain
- [ ] Both projects redeployed after setting environment variables

---

## Testing Your Deployment

### 1. Backend Health Check
```bash
# In browser or curl
https://saeds.vercel.app/api/health
```

**Expected**: `{"status":"OK","message":"SAEDS Backend Server is running",...}`

### 2. Frontend Build Check
```bash
# In browser
https://saeds-klj8.vercel.app
```

**Expected**: React app loads, no console errors

### 3. API Integration Check
```javascript
// In browser console on frontend
fetch('https://saeds.vercel.app/api/stats')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected**: Stats data returned, no CORS errors

### 4. Authentication Check
```javascript
// After logging in with Firebase
// Check if user syncs to MongoDB
```

**Expected**: User appears in MongoDB, no errors

---

## Getting Help

If you're still having issues:

1. **Check Vercel Function Logs**:
   - Backend Project → Deployments → Latest → View Function Logs
   - Look for specific error messages

2. **Check Browser Console**:
   - F12 → Console tab
   - Look for error messages
   - Check Network tab for failed requests

3. **Verify URLs**:
   - Backend URL: `https://saeds.vercel.app`
   - Frontend URL: `https://saeds-klj8.vercel.app`
   - API calls go to: `https://saeds.vercel.app/api/*`

4. **Common Issues**:
   - Environment variables not set → Set in Vercel dashboard
   - Old deployment cached → Manual redeploy
   - Wrong URLs → Check `.env` files and Vercel settings

---

## Summary of Changes Made

1. ✅ Fixed CORS configuration in `backend/app.js`
2. ✅ Fixed CORS configuration in `backend/api/index.js`
3. ✅ Removed conflicting CORS headers from `backend/vercel.json`
4. ✅ Updated environment variable examples
5. ✅ Created comprehensive documentation

**Next**: Wait for Vercel to deploy, then test your application!
