# 🚀 SAEDS Community Hub - Quick Start Guide

## ✅ What's Ready

Your application now has:
1. ✅ **Frontend** - React app with Firebase Authentication
2. ✅ **Backend** - Express server with MongoDB Atlas
3. ✅ **Database** - MongoDB Atlas connected and running
4. ✅ **API** - RESTful endpoints for users, books, and activities

## 🏃 Running the Application

### Backend Server (Already Running)
The backend is currently running on **http://localhost:5000**

To restart it:
```bash
cd "e:\saeds website\backend"
npm start
```

### Frontend App
```bash
cd "e:\saeds website\frontend"
npm start
```

The frontend will open at **http://localhost:3000**

## 📊 Populate Database with Sample Data

Run this command to add sample books and activities:
```bash
cd "e:\saeds website\backend"
npm run seed
```

This adds:
- 8 sample books (Fiction, Science Fiction, Romance, etc.)
- 5 sample activities (Workshops, Seminars, Networking events)

## 🔗 How It Works

### 1. User Authentication Flow
```
User Signs Up/In (Firebase)
    ↓
Frontend detects auth change
    ↓
Automatically syncs to MongoDB
    ↓
User data stored in both Firebase & MongoDB
```

### 2. Data Flow
```
Frontend (React)
    ↓
API Service (src/services/api.js)
    ↓
Backend Server (localhost:5000)
    ↓
MongoDB Atlas (Cloud Database)
```

## 📡 Testing the Setup

### 1. Test Backend Health
Open in browser: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "OK",
  "message": "SAEDS Backend Server is running",
  "timestamp": "2025-10-25T..."
}
```

### 2. Test Books API
Open in browser: http://localhost:5000/api/books

You'll see all books from the database.

### 3. Test User Sync
1. Start the frontend: `npm start`
2. Sign up for a new account
3. Check browser console - you should see: "✅ User synced to MongoDB"
4. Visit: http://localhost:5000/api/users (you'll see your user data)

## 🎯 Key Features

### Firebase Authentication
- ✅ Email/Password sign up and sign in
- ✅ Google authentication
- ✅ Auto-sync to MongoDB
- ✅ Protected routes

### MongoDB Integration
- ✅ User profiles stored in database
- ✅ Books catalog with categories
- ✅ Activities/Events management
- ✅ User favorites tracking
- ✅ Reading goals

### API Endpoints Available

**Users:**
- GET `/api/users` - All users
- POST `/api/users/sync` - Sync Firebase user
- GET `/api/users/firebase/:uid` - Get by Firebase ID

**Books:**
- GET `/api/books` - All books
- GET `/api/books?category=Fiction` - Filter by category
- GET `/api/books?search=gatsby` - Search books
- POST `/api/books/:id/download` - Track downloads

**Activities:**
- GET `/api/activities` - All activities
- GET `/api/activities?upcoming=true` - Upcoming only
- POST `/api/activities/:id/register/:userId` - Register

## 🛠️ Using the API in Frontend

The API service is ready to use in your components:

```javascript
import { bookAPI, activityAPI, userAPI } from '../services/api';

// Get all books
const { data: books } = await bookAPI.getAll();

// Search books
const { data: results } = await bookAPI.getAll({ search: 'gatsby' });

// Get upcoming activities
const { data: activities } = await activityAPI.getUpcoming();

// Add to favorites
await userAPI.addFavorite(userId, bookId);
```

## 📁 Project Structure

```
saeds website/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Page components
│   │   ├── context/            # Auth context
│   │   ├── services/           # API service ✨ NEW
│   │   ├── config.js           # Firebase config
│   │   └── App.js
│   └── package.json
│
├── backend/                     # Express server ✨ NEW
│   ├── config/                 # Database config
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── .env                    # Environment variables
│   ├── server.js               # Main server
│   ├── seedData.js             # Sample data
│   └── package.json
│
└── MONGODB_SETUP_COMPLETE.md   # Full documentation
```

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (optional .env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎨 Next Steps

### 1. Update Browse Page to Use MongoDB
```javascript
// In src/pages/Browse.js
import { bookAPI } from '../services/api';

const Browse = () => {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await bookAPI.getAll();
      setBooks(data);
    };
    fetchBooks();
  }, []);
  
  // ... rest of component
};
```

### 2. Update Activity Page
```javascript
// In src/pages/Activity.js
import { activityAPI } from '../services/api';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await activityAPI.getUpcoming();
      setActivities(data);
    };
    fetchActivities();
  }, []);
  
  // ... rest of component
};
```

### 3. Add Favorites Feature
```javascript
// In any component
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const addToFavorites = async (bookId) => {
  const { currentUser } = useAuth();
  // Get MongoDB user ID first
  const { data: user } = await userAPI.getByFirebaseUid(currentUser.uid);
  await userAPI.addFavorite(user._id, bookId);
};
```

## 🐛 Common Issues

### Backend won't start
- Check if port 5000 is in use
- Verify MongoDB connection string in .env

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check for CORS errors in browser console

### User not syncing to MongoDB
- Check browser console for errors
- Verify backend is running
- Check network tab in DevTools

## 📞 API Documentation

Full API documentation is in: `backend/README.md`

## 🎊 You're All Set!

Your full-stack application is ready:
1. ✅ Frontend running on localhost:3000
2. ✅ Backend running on localhost:5000
3. ✅ MongoDB Atlas connected
4. ✅ Firebase Authentication working
5. ✅ Auto user sync enabled

**Start building your features!** 🚀
