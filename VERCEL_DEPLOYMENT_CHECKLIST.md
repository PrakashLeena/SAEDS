# Vercel Deployment Checklist

Use this checklist to ensure your Firebase and backend functions work on Vercel.

## ✅ Pre-Deployment Checklist

### Frontend Environment Variables (Vercel Dashboard)
- [ ] `REACT_APP_API_URL` - Points to backend Vercel URL
- [ ] `REACT_APP_FIREBASE_API_KEY` - Set correctly
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN` - Set correctly
- [ ] `REACT_APP_FIREBASE_PROJECT_ID` - Set correctly
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET` - Uses `.appspot.com` (NOT `.firebasestorage.app`)
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Set correctly
- [ ] `REACT_APP_FIREBASE_APP_ID` - Set correctly
- [ ] `REACT_APP_FIREBASE_MEASUREMENT_ID` - Set correctly ⚠️ **Often missed!**

### Backend Environment Variables (Vercel Dashboard)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `FRONTEND_URL` - Points to frontend Vercel URL (no trailing slash)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `CLOUDINARY_CLOUD_NAME` - Set correctly
- [ ] `CLOUDINARY_API_KEY` - Set correctly
- [ ] `CLOUDINARY_API_SECRET` - Set correctly
- [ ] `EMAIL_SERVICE` - Set correctly
- [ ] `EMAIL_USER` - Set correctly
- [ ] `EMAIL_PASSWORD` - Set correctly
- [ ] `CONTACT_EMAIL` - Set correctly

### Firebase Console Configuration
- [ ] Go to Firebase Console → Authentication → Settings → Authorized domains
- [ ] Add your Vercel frontend domain (e.g., `your-app.vercel.app`)
- [ ] Keep `localhost` for local development
- [ ] Add custom domain if you have one

### Code Configuration
- [ ] `frontend/src/config.js` uses environment variables (not hardcoded)
- [ ] `frontend/vercel.json` exists with proper rewrites
- [ ] `backend/api/index.js` exists for serverless deployment
- [ ] `backend/vercel.json` exists with proper routes

## 🚀 Deployment Steps

### 1. Deploy Backend First
- [ ] Create new Vercel project for backend
- [ ] Set Root Directory to `backend`
- [ ] Add all backend environment variables
- [ ] Deploy
- [ ] Copy the backend URL (e.g., `https://your-backend.vercel.app`)

### 2. Deploy Frontend
- [ ] Create new Vercel project for frontend
- [ ] Set Root Directory to `frontend`
- [ ] Add all frontend environment variables
- [ ] Set `REACT_APP_API_URL` to backend URL + `/api`
- [ ] Deploy
- [ ] Copy the frontend URL (e.g., `https://your-frontend.vercel.app`)

### 3. Update Cross-References
- [ ] Update backend `FRONTEND_URL` to point to frontend URL
- [ ] Redeploy backend
- [ ] Add frontend URL to Firebase Authorized Domains

## ✅ Post-Deployment Verification

### Test Firebase Authentication
- [ ] Open frontend Vercel URL
- [ ] Open browser console (F12)
- [ ] Navigate to Sign In page
- [ ] Try Google Sign In
- [ ] Try Email/Password Sign In
- [ ] Check for Firebase errors in console
- [ ] Verify successful authentication and redirect

### Test Backend API
- [ ] Open browser Network tab (F12 → Network)
- [ ] Navigate through the app
- [ ] Check API requests return 200 status
- [ ] Verify no CORS errors
- [ ] Test book downloads
- [ ] Test contact form submission
- [ ] Test gallery image loading

### Test User Features
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Add book to favorites
- [ ] Download a book
- [ ] View profile page
- [ ] Sign out

### Test Admin Features (if applicable)
- [ ] Sign in as admin
- [ ] Upload a book
- [ ] Upload a gallery image
- [ ] Manage members
- [ ] View statistics

## 🐛 Troubleshooting

### If Firebase Authentication Fails
1. Check browser console for specific error
2. Verify all `REACT_APP_FIREBASE_*` variables are set in Vercel
3. Verify Vercel domain is in Firebase Authorized Domains
4. Hard refresh browser (Ctrl+Shift+R)
5. Try incognito mode

### If Backend API Fails
1. Check Network tab for CORS errors
2. Verify `FRONTEND_URL` in backend matches frontend URL
3. Verify `REACT_APP_API_URL` in frontend matches backend URL
4. Check Vercel Function Logs for backend errors
5. Verify MongoDB connection string is correct

### If Images/Files Don't Load
1. Verify Cloudinary credentials in backend
2. Check Network tab for failed image requests
3. Verify Cloudinary URLs in database are correct

## 📝 Common Mistakes

- ❌ Forgetting `REACT_APP_FIREBASE_MEASUREMENT_ID`
- ❌ Using `.firebasestorage.app` instead of `.appspot.com` for storage bucket
- ❌ Not adding Vercel domain to Firebase Authorized Domains
- ❌ Trailing slash in `FRONTEND_URL` or `REACT_APP_API_URL`
- ❌ Not redeploying after changing environment variables
- ❌ Using old browser cache (need hard refresh)
- ❌ Environment variables not set for all environments (Production, Preview, Development)

## 🎯 Quick Fix Commands

### Redeploy Frontend
```bash
cd frontend
git add .
git commit -m "Update configuration"
git push origin main
```

### Redeploy Backend
```bash
cd backend
git add .
git commit -m "Update configuration"
git push origin main
```

### Test Build Locally
```bash
# Frontend
cd frontend
npm run build
npx serve -s build

# Backend
cd backend
npm start
```

## 📚 Additional Resources

- [VERCEL_FIREBASE_FIX.md](../VERCEL_FIREBASE_FIX.md) - Detailed fix guide
- [FIREBASE_FIX.md](../FIREBASE_FIX.md) - Local Firebase configuration
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Original deployment guide
- [Firebase Console](https://console.firebase.google.com/project/saeds-c04b1)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Last Updated:** October 29, 2025
**Status:** ✅ Ready for deployment
