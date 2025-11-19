const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const router = express.Router();

const storageRoot = process.env.FILE_STORAGE_PATH || path.join('/tmp', 'saeds', 'uploads');
const uploadsDir = path.join(storageRoot, 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const allowedTypes = /jpeg|jpg|png|gif|webp/;
const fileFilter = (_req, file, cb) => {
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const ensureAdmin = async (req) => {
  const firebaseUid =
    req.body?.firebaseUid ||
    req.headers['x-firebase-uid'] ||
    req.query.firebaseUid;

  if (!firebaseUid) {
    const err = new Error('Authentication required');
    err.status = 401;
    throw err;
  }

  const user = await User.findOne({ firebaseUid });
  if (!user || user.role !== 'admin') {
    const err = new Error('Admin privileges required');
    err.status = 403;
    throw err;
  }
  return user;
};

const buildImagePayload = (req, filename) => {
  const baseUrl =
    process.env.FILE_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return {
    id: filename,
    url: `${baseUrl}/uploads/images/${filename}`,
    name: filename,
  };
};

const deleteLocalFile = async (filename) => {
  const filePath = path.join(uploadsDir, filename);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
};

router.get('/images', async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    const images = files
      .filter((file) => allowedTypes.test(path.extname(file)))
      .map((file) => buildImagePayload(req, file));

    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res
      .status(500)
      .json({ success: false, message: 'Unable to read images', error: error.message });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    await ensureAdmin(req);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const image = buildImagePayload(req, req.file.filename);
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: image,
    });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    if (req.file?.filename) {
      await deleteLocalFile(req.file.filename);
    }
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message || 'Failed to upload image' });
  }
});

router.delete('/images/:id', async (req, res) => {
  try {
    await ensureAdmin(req);

    const { id } = req.params;
    const filePath = path.join(uploadsDir, id);

    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message || 'Failed to delete image' });
  }
});

module.exports = router;

