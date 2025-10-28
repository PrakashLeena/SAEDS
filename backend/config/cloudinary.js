const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ds2z0fox9',
  api_key: process.env.CLOUDINARY_API_KEY || '128966933841541',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'SgEU1B33BQOPwfrjOw--MWLdFc4',
});

module.exports = cloudinary;
