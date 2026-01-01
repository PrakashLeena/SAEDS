const { google } = require('googleapis');

// Google Drive client configured for service account
// Prefer environment variables; fall back to keyFile in local development.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

let auth;

if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    SCOPES,
  );
} else {
  auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 'elibrary-storage.json',
    scopes: SCOPES,
  });
}

const drive = google.drive({ version: 'v3', auth });

module.exports = drive;
