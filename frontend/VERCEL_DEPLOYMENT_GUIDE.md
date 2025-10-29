# Frontend Deployment Guide for Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your backend API deployed and accessible (e.g., on Vercel or another platform)
- Firebase project credentials

## Step-by-Step Deployment

### 1. Prepare Environment Variables
Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important:** Replace the placeholder values with your actual credentials.

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure the project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)
4. Add environment variables (see Step 1)
5. Click **Deploy**

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Verify Deployment

After deployment:

1. Open your Vercel deployment URL
2. Check the browser console for any errors (F12 → Console)
3. Verify that:
   - The homepage loads correctly
   - Navigation works
   - API calls are successful (check Network tab)

### Common Issues and Solutions

#### White Screen Issue
**Cause:** Missing environment variables or incorrect build configuration

**Solution:**
1. Verify all environment variables are set in Vercel
2. Check that `REACT_APP_API_URL` points to your backend
3. Ensure the build completed successfully in Vercel deployment logs
4. Clear browser cache and hard reload (Ctrl+Shift+R)

#### API Calls Failing
**Cause:** CORS issues or incorrect API URL

**Solution:**
1. Verify `REACT_APP_API_URL` is correct
2. Ensure your backend allows requests from your Vercel frontend URL
3. Check backend CORS configuration includes your frontend domain

#### Routing Issues (404 on refresh)
**Cause:** SPA routing not configured

**Solution:**
- The `vercel.json` file should already handle this with rewrites
- Verify `vercel.json` exists in the frontend directory

#### Firebase Authentication Not Working
**Cause:** Missing or incorrect Firebase credentials

**Solution:**
1. Double-check all `REACT_APP_FIREBASE_*` variables
2. Ensure Firebase project allows your Vercel domain in authorized domains
3. Go to Firebase Console → Authentication → Settings → Authorized domains
4. Add your Vercel domain (e.g., `your-app.vercel.app`)

### 4. Update Backend CORS

Make sure your backend allows requests from your Vercel frontend URL:

```javascript
// In your backend CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend.vercel.app'
];
```

### 5. Continuous Deployment

Vercel automatically deploys:
- **Production:** When you push to your main/master branch
- **Preview:** When you create a pull request

To disable auto-deployment:
1. Go to Project Settings → Git
2. Configure deployment branches

### 6. Custom Domain (Optional)

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed by Vercel

## Troubleshooting Commands

### Check Build Locally
```bash
cd frontend
npm run build
npx serve -s build
```

### View Build Logs
- Go to Vercel Dashboard → Deployments → Click on deployment → View logs

### Test Environment Variables
Add this temporarily to your app to verify env vars are loaded:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure backend is running and accessible
5. Check Firebase configuration

## Additional Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
