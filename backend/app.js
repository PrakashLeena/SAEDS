require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();

// Connect to MongoDB (serverless-friendly: will reuse connection when possible)
connectDB();

const defaultFrontend = process.env.FRONTEND_URL || 'https://saeds-klj8.vercel.app';
const staticOrigins = [
  defaultFrontend,
  'https://saeds-klj8.vercel.app',
  'https://saeds.vercel.app',
  'https://saeds-tau.vercel.app',
  'http://localhost:3000',
  'http://localhost:3002',
].filter(Boolean);

const previewPatterns = [
  /^https:\/\/saeds-klj8-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/saeds-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/,
];

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  if (!origin) {
    return callback(null, { origin: true, credentials: true });
  }

  const isAllowed =
    staticOrigins.some((allowed) => allowed === origin) ||
    previewPatterns.some((regex) => regex.test(origin)) ||
    origin.includes('a-g-prakash-leenas-projects.vercel.app');

  callback(null, {
    origin: isAllowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-firebase-uid'],
  });
};

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsRoot = process.env.FILE_STORAGE_PATH || path.join('/tmp', 'saeds', 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  try {
    fs.mkdirSync(uploadsRoot, { recursive: true });
  } catch (err) {
    console.warn('Unable to create uploads root directory:', uploadsRoot, err.message);
  }
}

// Serve uploaded static files (uploads folder) with caching
app.use('/uploads', express.static(uploadsRoot, {
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
const elibraryRoutes = require('./routes/elibraryRoutes');
const galleryFsRoutes = require('./routes/galleryFsRoutes');

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
app.use('/api/elibrary', elibraryRoutes);
app.use('/api/gallery-fs', galleryFsRoutes);

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
