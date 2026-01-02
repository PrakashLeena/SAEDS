const { google } = require('googleapis');

// Google Drive client configured for service account
// Prefer environment variables; fall back to keyFile in local development.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

let auth;

if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  console.log('Google Drive config: using service account credentials from environment variables');
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    SCOPES,
  );
} else {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 'elibrary-storage.json';
  console.log('Google Drive config: using keyFile for credentials', { keyFile });
  auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: SCOPES,
  });
}

const drive = google.drive({ version: 'v3', auth });

module.exports = drive;
