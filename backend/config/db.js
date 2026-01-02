const mongoose = require('mongoose');

// Cache the connection for serverless
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Serverless-friendly settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    if (!process.env.MONGODB_URI) {
      console.error('ℹ️ MONGODB_URI is not set in the environment.');
    } else {
      let prefix = 'unknown';
      if (process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
        prefix = 'mongodb+srv://';
      } else if (process.env.MONGODB_URI.startsWith('mongodb://')) {
        prefix = 'mongodb://';
      }
      console.error('ℹ️ MONGODB_URI appears to be set. Prefix detected:', prefix);
    }
    throw error;
  }
};

module.exports = connectDB;
