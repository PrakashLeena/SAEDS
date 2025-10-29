# Vercel Environment Variables Setup Commands

## Quick Copy-Paste Commands for Vercel CLI

If you have Vercel CLI installed, you can use these commands to set environment variables quickly.

### Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

---

## Backend Environment Variables

Navigate to backend directory and run:

```bash
cd backend

# Set environment variables for production
vercel env add FRONTEND_URL production
# When prompted, enter: https://your-frontend.vercel.app

vercel env add MONGODB_URI production
# When prompted, enter your MongoDB connection string

vercel env add NODE_ENV production
# When prompted, enter: production

vercel env add CLOUDINARY_CLOUD_NAME production
# When prompted, enter: ds2z0fox9

vercel env add CLOUDINARY_API_KEY production
# When prompted, enter: 128966933841541

vercel env add CLOUDINARY_API_SECRET production
# When prompted, enter: SgEU1B33BQOPwfrjOw--MWLdFc4

vercel env add EMAIL_SERVICE production
# When prompted, enter: gmail

vercel env add EMAIL_USER production
# When prompted, enter: saedsmail2025@gmail.com

vercel env add EMAIL_PASSWORD production
# When prompted, enter: kpyjjytladjgqjxb

vercel env add CONTACT_EMAIL production
# When prompted, enter: saedsmail2025@gmail.com
```

---

## Frontend Environment Variables

Navigate to frontend directory and run:

```bash
cd frontend

# Set environment variables for production
vercel env add REACT_APP_API_URL production
# When prompted, enter: https://your-backend.vercel.app/api

vercel env add REACT_APP_FIREBASE_API_KEY production
# When prompted, enter: AIzaSyAAq5pyl5oTxYZpiYKesH0HTeyph66sSCk

vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production
# When prompted, enter: saeds-c04b1.firebaseapp.com

vercel env add REACT_APP_FIREBASE_PROJECT_ID production
# When prompted, enter: saeds-c04b1

vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production
# When prompted, enter: saeds-c04b1.appspot.com

vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production
# When prompted, enter: 190411788882

vercel env add REACT_APP_FIREBASE_APP_ID production
# When prompted, enter: 1:190411788882:web:541f6f42d4552a1456858b

vercel env add REACT_APP_FIREBASE_MEASUREMENT_ID production
# When prompted, enter: G-ZHLVKFDBHF
```

---

## Alternative: Using Vercel Dashboard (Easier)

### Backend Project:
1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable with values from `backend/.env.example`
6. Select **Production**, **Preview**, and **Development**
7. Click **Save**

### Frontend Project:
1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable with values from `frontend/.env.example`
6. Select **Production**, **Preview**, and **Development**
7. Click **Save**

---

## After Setting Environment Variables

### Redeploy Both Projects:

**Option 1: Using Vercel Dashboard**
1. Go to your project → **Deployments**
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

**Option 2: Using Git Push**
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy after env vars"
git push origin main
```

**Option 3: Using Vercel CLI**
```bash
# In backend directory
cd backend
vercel --prod

# In frontend directory
cd frontend
vercel --prod
```

---

## Verify Environment Variables Are Set

### Check Backend Variables:
```bash
cd backend
vercel env ls
```

### Check Frontend Variables:
```bash
cd frontend
vercel env ls
```

---

## Important Notes:

1. **FRONTEND_URL** in backend must match your frontend Vercel URL exactly
2. **REACT_APP_API_URL** in frontend must match your backend Vercel URL + `/api`
3. Environment variables only take effect after redeployment
4. Always set variables for **Production**, **Preview**, and **Development** environments
5. No trailing slashes in URLs!

---

## Example URLs:

If your deployments are:
- Backend: `https://saeds-backend-abc123.vercel.app`
- Frontend: `https://saeds-klj8.vercel.app`

Then:
- Backend `FRONTEND_URL` = `https://saeds-klj8.vercel.app`
- Frontend `REACT_APP_API_URL` = `https://saeds-backend-abc123.vercel.app/api`
