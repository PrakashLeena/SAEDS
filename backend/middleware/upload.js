const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (we'll upload to Cloudinary from memory)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // For profile photos and book covers
  if (file.fieldname === 'profilePhoto' || file.fieldname === 'coverImage') {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for photos!'));
    }
  }

  // For PDFs
  if (file.fieldname === 'pdfFile') {
    const isPdf = file.mimetype === 'application/pdf';
    if (isPdf) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }

  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

module.exports = upload;
