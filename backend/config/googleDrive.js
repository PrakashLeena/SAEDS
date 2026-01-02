const { google } = require('googleapis');

// Google Drive client configured for service account
// Prefer environment variables; fall back to keyFile in local development.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

let auth;

if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  console.log('Google Drive config: using service account credentials from environment variables');
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
  auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: SCOPES,
  });

  // Proactively authorize so we see clear errors in logs if credentials are invalid
  auth.authorize()
    .then(() => {
      console.log('Google Drive JWT authorization succeeded');
    })
    .catch(err => {
      console.error('Google Drive JWT authorization error:', err && err.message);
    });
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
