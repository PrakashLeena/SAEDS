require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Initialize Express app
const app = express();

// Connect to MongoDB (serverless-friendly: will reuse connection when possible)
connectDB();

// Enable CORS for all routes
app.use((req, res, next) => {
  // Get frontend URL from environment variable or use default
  const frontendUrl = process.env.FRONTEND_URL || 'https://saeds-klj8.vercel.app';
  
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isAllowed = 
    origin === frontendUrl ||
    origin === 'https://saeds-klj8.vercel.app' ||
    origin === 'https://saeds.vercel.app' ||
    origin === 'http://localhost:3000' ||
    origin === 'http://localhost:3002' ||
    // Allow all Vercel preview deployments for saeds-klj8
    (origin && origin.match(/^https:\/\/saeds-klj8-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/)) ||
    // Allow all Vercel preview deployments for saeds
    (origin && origin.match(/^https:\/\/saeds-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/)) ||
    // Allow all preview deployments with the pattern
    (origin && origin.includes('a-g-prakash-leenas-projects.vercel.app'));
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-firebase-uid');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files (uploads folder) with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  immutable: true
}));

// Import routes
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const activityRoutes = require('./routes/activityRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const statsRoutes = require('./routes/statsRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const memberRoutes = require('./routes/memberRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SAEDS Backend Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SAEDS Community Hub API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      books: '/api/books',
      activities: '/api/activities',
      upload: '/api/upload',
      contact: '/api/contact',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
