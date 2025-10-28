Deployment guide for Vercel (frontend and backend)

This repository contains two apps:
- frontend/ — React app (Create React App)
- backend/  — Express app with API routes

Goal: deploy both to Vercel. The frontend will be a static site. The backend will be deployed as serverless functions using the Express app exported from `backend/app.js`.

Steps — Frontend
1. In Vercel dashboard, create a new project and import this Git repository.
2. Set the "Root Directory" to `frontend`.
3. Vercel will detect a Create React App. Ensure build command is `npm run build` and Output Directory is `build` (Vercel auto-detects this when using `@vercel/static-build`).
4. Add any environment variables needed by the frontend (for example `REACT_APP_API_URL` pointing to your backend deployment URL).
5. Deploy.

Steps — Backend
Option A (recommended): Deploy backend as a separate Vercel project
1. In Vercel dashboard, create another project and import the same repository.
2. Set the "Root Directory" to `backend`.
3. Vercel will treat files under `api/` as serverless functions. We added `backend/api/index.js` which forwards requests to the Express app exported from `backend/app.js`.
4. Add required environment variables in the Vercel project settings (Environment Variables):
   - MONGODB_URI (MongoDB connection string)
   - CLOUDINARY_URL (or CLOUDINARY_* values used in your config)
   - EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASS (or however nodemailer is configured)
   - FRONTEND_URL (optional)
   - Any other secrets used by the backend
5. Deploy. Vercel will run serverless functions for your API routes.

Notes and caveats
- Serverless cold-starts: The Express app will be loaded on first invocation of a function. We call `connectDB()` in `backend/app.js` which should reuse connections across warm invocations when supported by your MongoDB driver and Vercel platform; ensure your `connectDB` implementation caches the connection.
- File uploads: this project uploads files to Cloudinary; ensure Cloudinary credentials are set in Vercel env vars.
- Static uploads: the app serves `uploads/` statically in the repository. In serverless environments, disk writes are ephemeral; rely on Cloudinary or external storage for persistent files.
- CORS: set `FRONTEND_URL` env var to your frontend Vercel URL so the backend allows requests from the frontend.

Troubleshooting
- If API routes return 404, confirm the Backend Vercel project root is `backend` and `backend/api/index.js` exists.
- If MongoDB connection fails, check `MONGODB_URI` and that your MongoDB cluster allows connections from Vercel IP ranges (or use a cloud provider that doesn't restrict IPs).

Optional improvements
- Add health check and monitoring endpoints.
- Convert large file downloads to stream-friendly responses to avoid function timeouts.
- Add automatic refresh of environment variables in frontend build via Vercel secrets.

If you want, I can:
- Prepare a single monorepo `vercel.json` that maps two projects automatically (not supported via file alone; Vercel dashboard is required), or
- Convert upload endpoints to directly use Cloudinary and remove any reliance on local disk (helpful for serverless environments), or
- Add instructions for preview deployments and Git integration.
