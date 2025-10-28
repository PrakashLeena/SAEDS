# Contact Form Troubleshooting Guide

## Issue: Contact form returns "Route not found" error

### Root Cause
The backend server was started BEFORE the contact routes were created, so it doesn't have the `/api/contact` endpoint loaded.

### Solution: Restart Backend Server

#### Step 1: Stop the Current Server

**Option A: If running in a terminal**
- Go to the terminal where the backend is running
- Press `Ctrl + C` to stop the server

**Option B: If you can't find the terminal**
- Open PowerShell as Administrator
- Run: `taskkill /F /PID 1064`
  (Replace 1064 with the actual PID if different)

#### Step 2: Start the Server Again

```bash
cd "e:\saeds website\backend"
npm run dev
```

You should see:
```
🚀 Server running on port 5000
🌍 Environment: development
🔗 Frontend URL: http://localhost:3000
```

#### Step 3: Verify Contact Route is Loaded

Open your browser and go to:
```
http://localhost:5000/
```

You should see the contact endpoint listed:
```json
{
  "message": "Welcome to SAEDS Community Hub API",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "books": "/api/books",
    "activities": "/api/activities",
    "upload": "/api/upload",
    "contact": "/api/contact",  ← This should be present
    "health": "/api/health"
  }
}
```

#### Step 4: Test the Contact Form

1. Go to your frontend: `http://localhost:3000/contact`
2. Fill out the form
3. Submit

### Expected Behavior

**If email is configured correctly:**
- You'll see "Message sent successfully!"
- Admin receives email at: saedsmail2025@gmail.com
- User receives confirmation email

**If email credentials are wrong:**
- Backend console will show detailed error
- Check the error message for authentication issues

### Common Issues After Restart

#### Issue 1: "Invalid login" or "Authentication failed"

**Cause:** Gmail app password is incorrect or has spaces

**Fix:** Update your `.env` file:
```env
EMAIL_PASSWORD=kpyjjytladjgqjxb
```
(No spaces in the password!)

#### Issue 2: "Less secure app access"

**Cause:** Not using Gmail App Password

**Fix:**
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate an App Password
4. Use that password in `.env`

#### Issue 3: Still getting 404

**Cause:** Server not restarted or wrong port

**Fix:**
1. Make sure backend is running on port 5000
2. Check `http://localhost:5000/` shows contact endpoint
3. Clear browser cache
4. Hard refresh frontend (Ctrl + Shift + R)

### Verification Checklist

- [ ] Backend server restarted after creating contactRoutes.js
- [ ] Server shows "Server running on port 5000"
- [ ] `http://localhost:5000/` shows contact endpoint
- [ ] `.env` file has email credentials (no spaces in password)
- [ ] Frontend is running on port 3000
- [ ] Browser cache cleared

### Testing Commands

**Test if server is running:**
```bash
curl http://localhost:5000/api/health
```

**Test contact endpoint (PowerShell):**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    subject = "Test"
    message = "Test message"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/contact" -Method POST -Body $body -ContentType "application/json"
```

### Backend Console Logs to Look For

When form is submitted, you should see:
```
Attempting to send email...
Email User: saedsmail2025@gmail.com
Email Service: gmail
Sending to admin: saedsmail2025@gmail.com
Admin email sent successfully
Sending confirmation to user: [user's email]
User confirmation email sent successfully
```

### Still Not Working?

1. **Check backend console** for error messages
2. **Check browser console** (F12) for frontend errors
3. **Verify all files exist:**
   - `backend/routes/contactRoutes.js` ✓
   - `backend/.env` with email config ✓
   - `frontend/src/pages/Contact.js` ✓

4. **Make sure both servers are running:**
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

### Quick Fix Script

If you want to quickly restart everything:

```bash
# Stop backend (if running)
# Then start fresh:
cd "e:\saeds website\backend"
npm run dev
```

In another terminal:
```bash
cd "e:\saeds website\frontend"
npm start
```

---

## Summary

**The main issue is that the server needs to be restarted** after creating the contact routes. Once restarted, the `/api/contact` endpoint will be available and the form will work.

After restarting, the contact form should work perfectly! 📧✅
