# SAEDS Community Hub - Backend API

Backend server for the SAEDS Community Hub application with MongoDB Atlas integration.

## 🚀 Features

- **MongoDB Atlas Integration** - Cloud database connection
- **RESTful API** - Clean and organized endpoints
- **User Management** - Firebase authentication sync
- **Book Management** - E-library CRUD operations
- **Activity Management** - Event registration and tracking
- **CORS Enabled** - Frontend integration ready

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment variables are already configured in `.env`:**
   - MongoDB Atlas connection string
   - Server port (5000)
   - JWT secret
   - Frontend URL for CORS

## 🏃 Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/firebase/:uid` - Get user by Firebase UID
- `POST /api/users/sync` - Create/update user from Firebase
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/favorites/:bookId` - Add book to favorites
- `DELETE /api/users/:id/favorites/:bookId` - Remove from favorites

### Books
- `GET /api/books` - Get all books (with filters: category, search, sort)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `POST /api/books/:id/download` - Increment download count
- `GET /api/books/meta/categories` - Get all categories

### Activities
- `GET /api/activities` - Get all activities (with filters)
- `GET /api/activities/:id` - Get single activity
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `POST /api/activities/:id/register/:userId` - Register for activity
- `DELETE /api/activities/:id/register/:userId` - Unregister from activity

## 📊 Database Models

### User
- Firebase UID
- Email, Display Name, Photo URL
- Books read, Downloads count
- Favorites (array of book IDs)
- Reading goals

### Book
- Title, Author, Category
- Description, Cover Image
- PDF URL, Pages
- Rating, Downloads
- Tags, ISBN

### Activity
- Title, Description, Category
- Date, Time, Location
- Organizer, Capacity
- Registered users
- Status (upcoming/ongoing/completed/cancelled)

## 🔒 Security Notes

⚠️ **Important**: 
- The `.env` file contains sensitive credentials
- Never commit `.env` to version control
- Change the JWT_SECRET in production
- Consider using environment-specific configuration

## 🧪 Testing the API

You can test the API using:
- **Postman** - Import the endpoints
- **cURL** - Command line testing
- **Browser** - For GET requests

Example:
```bash
# Health check
curl http://localhost:5000/api/health

# Get all books
curl http://localhost:5000/api/books
```

## 📝 Database Connection

The MongoDB Atlas connection is configured in `.env`:
```
MONGODB_URI=mongodb+srv://saedsmail2025:Saeds2025@cluster0.ave1khj.mongodb.net/saeds?appName=Cluster0
```

Database name: **saeds**

## 🔄 Syncing with Frontend

The backend is configured to accept requests from `http://localhost:3000` (React frontend).

To sync a Firebase user with MongoDB:
```javascript
POST /api/users/sync
{
  "firebaseUid": "user_firebase_id",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://..."
}
```

## 📦 Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   ├── Book.js            # Book schema
│   └── Activity.js        # Activity schema
├── routes/
│   ├── userRoutes.js      # User endpoints
│   ├── bookRoutes.js      # Book endpoints
│   └── activityRoutes.js  # Activity endpoints
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── server.js             # Main server file
└── package.json          # Dependencies
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
- Verify your IP is whitelisted in MongoDB Atlas
- Check the connection string is correct
- Ensure network access is configured

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using port 5000

### CORS Errors
- Verify FRONTEND_URL in `.env` matches your React app URL
- Check the frontend is running on the correct port

## 📞 Support

For issues or questions, please check the MongoDB Atlas dashboard and ensure:
1. Database user credentials are correct
2. Network access allows your IP
3. Database name matches the connection string
