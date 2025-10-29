# Quick Connection Fix Checklist

## ⚠️ CRITICAL: Your Backend and Frontend Are Not Connected

### What You Need to Do RIGHT NOW:

## Step 1: Get Your Deployment URLs

1. **Backend URL**: Go to Vercel → Your Backend Project → Copy the URL
   - Example: `https://saeds-backend-xyz.vercel.app`
   
2. **Frontend URL**: Go to Vercel → Your Frontend Project → Copy the URL
   - Example: `https://saeds-klj8.vercel.app`

---

## Step 2: Set Backend Environment Variables

Go to **Backend Vercel Project** → **Settings** → **Environment Variables**

Add/Update these (for Production, Preview, Development):

```
FRONTEND_URL=https://saeds-klj8.vercel.app
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=ds2z0fox9
CLOUDINARY_API_KEY=128966933841541
CLOUDINARY_API_SECRET=SgEU1B33BQOPwfrjOw--MWLdFc4
EMAIL_SERVICE=gmail
EMAIL_USER=saedsmail2025@gmail.com
EMAIL_PASSWORD=kpyjjytladjgqjxb
CONTACT_EMAIL=saedsmail2025@gmail.com
```

**Replace `https://saeds-klj8.vercel.app` with YOUR actual frontend URL!**

---

## Step 3: Set Frontend Environment Variables

Go to **Frontend Vercel Project** → **Settings** → **Environment Variables**

Add/Update these (for Production, Preview, Development):

```
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_FIREBASE_API_KEY=AIzaSyAAq5pyl5oTxYZpiYKesH0HTeyph66sSCk
REACT_APP_FIREBASE_AUTH_DOMAIN=saeds-c04b1.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saeds-c04b1
REACT_APP_FIREBASE_STORAGE_BUCKET=saeds-c04b1.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=190411788882
REACT_APP_FIREBASE_APP_ID=1:190411788882:web:541f6f42d4552a1456858b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ZHLVKFDBHF
```

**Replace `https://your-backend.vercel.app/api` with YOUR actual backend URL + `/api`!**

---

## Step 4: Redeploy Both Projects

After setting environment variables:

1. **Redeploy Backend**: Go to Backend Project → Deployments → Click "..." → Redeploy
2. **Redeploy Frontend**: Go to Frontend Project → Deployments → Click "..." → Redeploy

**IMPORTANT**: Environment variables only take effect after redeployment!

---

## Step 5: Test the Connection

### Test Backend:
Open in browser: `https://your-backend.vercel.app/api/health`

Should see:
```json
{
  "status": "OK",
  "message": "SAEDS Backend Server is running"
}
```

### Test Frontend:
1. Open your frontend URL
2. Press F12 → Console
3. Run:
```javascript
fetch(process.env.REACT_APP_API_URL + '/health')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d))
  .catch(e => console.error('❌ Error:', e))
```

---

## Common Issues:

### ❌ "Failed to fetch"
- Check `REACT_APP_API_URL` is set correctly in frontend
- Verify backend is deployed and accessible

### ❌ "CORS error"
- Check `FRONTEND_URL` in backend matches your frontend URL exactly
- Redeploy backend after changing

### ❌ "404 Not Found"
- Backend routing issue - see VERCEL_CONNECTION_FIX.md

---

## Current Configuration Status:

- ✅ Backend has CORS configured for: `https://saeds-klj8.vercel.app`
- ⚠️ Frontend fallback API URL: `https://saeds-backend.vercel.app/api` (may be incorrect)
- ⚠️ You MUST set `REACT_APP_API_URL` in Vercel environment variables

---

## Need More Help?

See detailed guide: `VERCEL_CONNECTION_FIX.md`
