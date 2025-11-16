const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const { isAdmin } = require('../middleware/adminAuth');
const GalleryImage = require('../models/GalleryImage');
const GalleryAlbum = require('../models/GalleryAlbum');
const ElibraryFile = require('../models/ElibraryFile');
const fetch = global.fetch || require('node-fetch');

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Upload activity image
router.post('/activity-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'saeds/activities', 'image');

    res.json({
      success: true,
      message: 'Activity image uploaded successfully',
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// Upload profile photo
router.post('/profile-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'saeds/profile-photos', 'image');

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error uploading profile photo' });
  }
});

// Upload book cover
router.post('/book-cover', upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'saeds/book-covers', 'image');

    res.json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error uploading book cover' });
  }
});

// Upload book PDF
router.post('/book-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'saeds/book-pdfs', 'raw');

    res.json({
      success: true,
      message: 'Book PDF uploaded successfully',
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error uploading book PDF' });
  }
});

// Upload e-library file
router.post('/elibrary', upload.single('file'), async (req, res) => {
  try {
    const { firebaseUid, title, description, folderId, folderTitle } = req.body || {};

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    if (!folderId) return res.status(400).json({ success: false, message: 'folderId is required' });

    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin privileges required' });

    const result = await uploadToCloudinary(req.file.buffer, 'saeds/elibrary', 'raw');

    const fileDoc = new ElibraryFile({
      title: title || req.file.originalname,
      description: description || '',
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: user._id,
      folderId,
      folderTitle: folderTitle || '',
      fileType: req.file.mimetype || 'application/pdf',
    });

    await fileDoc.save();

    res.json({ success: true, data: fileDoc, message: 'File uploaded to e-library' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload e-library file' });
  }
});

// List e-library files
router.get('/elibrary', async (req, res) => {
  try {
    const folderId = req.query.folderId || null;
    const filter = folderId ? { folderId } : {};
    const files = await ElibraryFile.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');
    res.json({ success: true, data: files });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list e-library files' });
  }
});

// Delete e-library file
router.delete('/elibrary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = req.body?.firebaseUid || req.headers['x-firebase-uid'];

    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin privileges required' });

    const file = await ElibraryFile.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    await cloudinary.uploader.destroy(file.publicId);
    await ElibraryFile.findByIdAndDelete(id);

    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
});

/*  
===========================================
 FIXED: Download ebook PDF (always .pdf)
===========================================
*/
router.get('/elibrary/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await ElibraryFile.findById(id);

    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    const remoteUrl = file.url;
    const resp = await fetch(remoteUrl);
    if (!resp.ok) return res.status(502).json({ success: false, message: 'Failed to fetch file' });

    const safeFilename = `${(file.title || 'document').replace(/[^a-z0-9._- ]/gi, '')}.pdf`;

    // Force PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Transfer-Encoding', 'binary');

    const body = resp.body;

    if (typeof body.pipe === 'function') {
      return body.pipe(res);
    }

    const { Readable } = require('stream');

    if (Readable.fromWeb) {
      return Readable.fromWeb(body).pipe(res);
    }

    const reader = body.getReader();
    const stream = new Readable({ read() {} });

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stream.push(Buffer.from(value));
      }
      stream.push(null);
    })();

    stream.pipe(res);
  } catch (err) {
    console.error('PDF Download Error:', err);
    res.status(500).json({ success: false, message: 'Failed to download PDF' });
  }
});

// =======================
// Gallery Uploads
// =======================

// Upload gallery image
router.post('/gallery', upload.single('image'), async (req, res) => {
  try {
    const { firebaseUid, title, description, albumId, albumTitle } = req.body;

    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'saeds/gallery', 'image');

    const imageDoc = new GalleryImage({
      title: title || '',
      description: description || '',
      url: result.secure_url,
      publicId: result.public_id,
    });

    if (firebaseUid) {
      const User = require('../models/User');
      const user = await User.findOne({ firebaseUid });
      if (user) imageDoc.uploadedBy = user._id;
    }

    if (albumId) {
      imageDoc.album = albumId;
    } else if (albumTitle) {
      let album = await GalleryAlbum.findOne({ title: albumTitle });
      if (!album) {
        album = await GalleryAlbum.create({ title: albumTitle });
      }
      imageDoc.album = album._id;
    }

    await imageDoc.save();

    res.json({ success: true, data: imageDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// List gallery images
router.get('/gallery', async (req, res) => {
  try {
    const filter = req.query.albumId ? { album: req.query.albumId } : {};
    const images = await GalleryImage.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list images' });
  }
});

// Create album
router.post('/albums', async (req, res) => {
  try {
    const { firebaseUid, title, description } = req.body;

    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin required' });

    const album = await GalleryAlbum.create({
      title,
      description: description || '',
      createdBy: user._id,
    });

    res.json({ success: true, data: album });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create album' });
  }
});

// List albums
router.get('/albums', async (req, res) => {
  try {
    const albums = await GalleryAlbum.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'galleryimages',
          localField: '_id',
          foreignField: 'album',
          as: 'images',
        },
      },
      { $addFields: { count: { $size: '$images' } } },
      { $project: { images: 0 } },
    ]);

    res.json({ success: true, data: albums });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list albums' });
  }
});

// Delete album
router.delete('/albums/:id', async (req, res) => {
  try {
    const firebaseUid = req.body?.firebaseUid || req.headers['x-firebase-uid'];
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin required' });

    const album = await GalleryAlbum.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    await GalleryImage.updateMany({ album: album._id }, { $set: { album: null } });
    await GalleryAlbum.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete album' });
  }
});

// Delete gallery image
router.delete('/gallery/:id', async (req, res) => {
  try {
    const firebaseUid = req.body?.firebaseUid || req.headers['x-firebase-uid'];
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });

    if (!user || user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin required' });

    const image = await GalleryImage.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    await cloudinary.uploader.destroy(image.publicId);
    await GalleryImage.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

module.exports = router;
