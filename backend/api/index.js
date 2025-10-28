// Vercel serverless entrypoint for the backend.
// This file exports a handler that forwards requests to the Express app.
const app = require('../app');

// For CommonJS, export a function that calls the express app
module.exports = (req, res) => {
  return app(req, res);
};
