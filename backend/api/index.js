const app = require('../app');
const { createServer } = require('http');

// Create HTTP server
const server = createServer(app);

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigins = [
    'https://saeds-klj8.vercel.app',
    'https://saeds-klj8-*.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.some(allowed => 
    origin === allowed || 
    (allowed.includes('*') && origin && origin.endsWith(allowed.split('*')[1]))
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-firebase-uid');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Forward the request to Express
  return app(req, res);
};
