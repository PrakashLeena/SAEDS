const app = require('../app');
const { createServer } = require('http');

// Create HTTP server
const server = createServer(app);

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Get frontend URL from environment variable or use default
  const frontendUrl = process.env.FRONTEND_URL || 'https://saeds-klj8.vercel.app';
  
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isAllowed = 
    origin === frontendUrl ||
    origin === 'https://saeds-klj8.vercel.app' ||
    origin === 'http://localhost:3000' ||
    origin === 'http://localhost:3002' ||
    // Allow all Vercel preview deployments for saeds-klj8
    (origin && origin.match(/^https:\/\/saeds-klj8-[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/)) ||
    // Allow all preview deployments with the pattern
    (origin && origin.includes('a-g-prakash-leenas-projects.vercel.app'));
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-firebase-uid');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Forward the request to Express
  return app(req, res);
};
