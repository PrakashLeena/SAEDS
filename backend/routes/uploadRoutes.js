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
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Upload activity image to Cloudinary (serverless-friendly)
router.post('/activity-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'saeds/activities',
      'image'
    );

    return res.json({
      success: true,
      message: 'Activity image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (err) {
    console.error('Error uploading activity image to Cloudinary:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload image', error: err.message });
  }
});

// Upload profile photo
router.post('/profile-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'saeds/profile-photos',
      'image'
    );

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile photo',
      error: error.message,
    });
  }
});

// Upload book cover image
router.post('/book-cover', upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'saeds/book-covers',
      'image'
    );

    res.json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Error uploading book cover:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading book cover',
      error: error.message,
    });
  }
});

// Upload book PDF
router.post('/book-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'saeds/book-pdfs',
      'raw' // Use 'raw' for PDFs
    );

    res.json({
      success: true,
      message: 'Book PDF uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Error uploading book PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading book PDF',
      error: error.message,
    });
  }
});

// Upload e-library file (admin)
router.post('/elibrary', upload.single('file'), async (req, res) => {
  try {
    const { firebaseUid, title, description, folderId, folderTitle } = req.body || {};

    console.log('POST /api/upload/elibrary called by firebaseUid:', firebaseUid, 'folderId:', folderId, 'folderTitle:', folderTitle);

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    if (!folderId) return res.status(400).json({ success: false, message: 'folderId is required' });

    // Basic admin check
    if (!firebaseUid) {
      console.warn('Elibrary upload rejected: missing firebaseUid');
      return res.status(401).json({ success: false, message: 'Authentication required (provide firebaseUid)' });
    }
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });
    console.log('Elibrary upload: found user:', user ? { id: user._id, email: user.email, role: user.role } : null);
    if (!user || user.role !== 'admin') {
      console.warn('Elibrary upload rejected: user not admin', firebaseUid);
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    // Upload to cloudinary (raw)
    const result = await uploadToCloudinary(req.file.buffer, 'saeds/elibrary', 'raw');

    const fileDoc = new ElibraryFile({
      title: title || req.file.originalname || 'Untitled',
      description: description || '',
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: user._id,
      folderId,
      folderTitle: folderTitle || '',
      fileType: req.file.mimetype || 'application/pdf',
    });

    await fileDoc.save();

    return res.json({ success: true, data: fileDoc, message: 'File uploaded to e-library' });
  } catch (err) {
    console.error('Error uploading elibrary file:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload elibrary file', error: err.message });
  }
});

// List e-library files (optional folder filter)
router.get('/elibrary', async (req, res) => {
  try {
    const folderId = req.query.folderId || null;
    const filter = {};
    if (folderId) filter.folderId = folderId;
    const files = await ElibraryFile.find(filter).sort({ createdAt: -1 }).populate('uploadedBy', 'name email').exec();
    return res.json({ success: true, data: files });
  } catch (err) {
    console.error('Error listing elibrary files:', err);
    return res.status(500).json({ success: false, message: 'Failed to list elibrary files' });
  }
});

// Delete elibrary file (admin)
router.delete('/elibrary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = (req.body && req.body.firebaseUid) || req.headers['x-firebase-uid'] || req.query.firebaseUid;
    if (!firebaseUid) return res.status(401).json({ success: false, message: 'Authentication required (provide firebaseUid)' });
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin privileges required' });

    const file = await ElibraryFile.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.publicId);
    } catch (err) {
      console.error('Cloudinary destroy error for', file.publicId, err);
    }

    await ElibraryFile.findByIdAndDelete(id);
    return res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    console.error('Error deleting elibrary file:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete file', error: err.message });
  }
});

// Download elibrary file (proxy)
router.get('/elibrary/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await ElibraryFile.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    const remoteUrl = file.url;
    const resp = await fetch(remoteUrl);
    if (!resp.ok) return res.status(502).json({ success: false, message: 'Failed to fetch file from storage' });

    const fallbackName = file.publicId ? file.publicId.split('/').pop() : `file-${id}`;
    const urlPath = new URL(remoteUrl).pathname;
    const extMatch = urlPath.match(/\.([a-z0-9]+)(?:$|\?)/i);
    const ext = extMatch ? extMatch[1] : 'pdf';
    const filename = `${(file.title && file.title.trim()) ? file.title.replace(/[^a-z0-9.-_ ]/gi, '') : fallbackName}${ext ? `.${ext}` : ''}`;

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const contentLength = resp.headers.get('content-length');
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const body = resp.body;
    if (!body) return res.status(500).json({ success: false, message: 'No body in remote response' });

    try {
      if (typeof body.pipe === 'function') {
        body.pipe(res);
      } else {
        const { Readable } = require('stream');
        if (typeof Readable.fromWeb === 'function') {
          Readable.fromWeb(body).pipe(res);
        } else {
          const reader = body.getReader();
          const stream = new Readable({ read() {} });
          (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                stream.push(Buffer.from(value));
              }
              stream.push(null);
            } catch (e) {
              stream.destroy(e);
            }
          })();
          stream.pipe(res);
        }
      }
    } catch (err) {
      console.error('Error piping file to response', err);
      return res.status(500).json({ success: false, message: 'Failed to stream file' });
    }
  } catch (err) {
    console.error('Error downloading elibrary file:', err);
    return res.status(500).json({ success: false, message: 'Failed to download file' });
  }
});

// Upload gallery image (admin only)
router.post('/gallery', upload.single('image'), async (req, res) => {
  try {
    // Expect firebaseUid in body for admin verification
    const { firebaseUid, title, description } = req.body;
    const { albumId, albumTitle } = req.body || {};
    // Simple admin check (middleware available but we rely on body here to attach user)
    // We'll fetch user by firebaseUid if provided to set uploadedBy

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Upload to Cloudinary under gallery folder
    const result = await uploadToCloudinary(req.file.buffer, 'saeds/gallery', 'image');

    // Create DB record
    const imageDoc = new GalleryImage({
      title: title || '',
      description: description || '',
      url: result.secure_url,
      publicId: result.public_id,
    });

    // If firebaseUid provided and matches a user, attach uploadedBy
    if (firebaseUid) {
      const User = require('../models/User');
      const user = await User.findOne({ firebaseUid });
      if (user) imageDoc.uploadedBy = user._id;
    }

    // Attach album if provided (albumId) or find/create by albumTitle
    if (albumId) {
      const album = await GalleryAlbum.findById(albumId);
      if (album) imageDoc.album = album._id;
    } else if (albumTitle) {
      let album = await GalleryAlbum.findOne({ title: albumTitle });
      if (!album) {
        const creatingUser = imageDoc.uploadedBy ? imageDoc.uploadedBy : null;
        album = new GalleryAlbum({ title: albumTitle, createdBy: creatingUser });
        await album.save();
      }
      imageDoc.album = album._id;
    }

    await imageDoc.save();

    return res.json({
      success: true,
      message: 'Gallery image uploaded',
      data: imageDoc,
    });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
});

// List gallery images (public)
router.get('/gallery', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const albumId = req.query.albumId || null;
    const filter = {};
    if (albumId) filter.album = albumId;
    const images = await GalleryImage.find(filter).sort({ createdAt: -1 }).limit(limit).populate('album').exec();
    return res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error listing gallery images:', error);
    return res.status(500).json({ success: false, message: 'Failed to list images' });
  }
});

// Albums endpoints
// Create album (admin)
router.post('/albums', async (req, res) => {
  try {
    const { firebaseUid, title, description } = req.body || {};
    if (!firebaseUid) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

    const album = new GalleryAlbum({ title, description: description || '', createdBy: user._id });
    await album.save();
    return res.json({ success: true, data: album });
  } catch (err) {
    console.error('Error creating album:', err);
    return res.status(500).json({ success: false, message: 'Failed to create album', error: err.message });
  }
});

// List albums (public)
router.get('/albums', async (req, res) => {
  try {
    // Return albums with image counts to avoid extra requests from frontend
    const albumsWithCount = await GalleryAlbum.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'galleryimages', // collection name for GalleryImage
          localField: '_id',
          foreignField: 'album',
          as: 'images',
        },
      },
      {
        $addFields: {
          count: { $size: '$images' },
        },
      },
      {
        $project: { images: 0 },
      },
    ]).exec();
    return res.json({ success: true, data: albumsWithCount });
  } catch (err) {
    console.error('Error listing albums:', err);
    return res.status(500).json({ success: false, message: 'Failed to list albums' });
  }
});

// Delete album (admin) - clears album reference from images and removes album doc
router.delete('/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = (req.body && req.body.firebaseUid) || req.headers['x-firebase-uid'] || req.query.firebaseUid;
    if (!firebaseUid) return res.status(401).json({ success: false, message: 'Authentication required (provide firebaseUid)' });

    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid });
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin privileges required' });

    const album = await GalleryAlbum.findById(id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    // Remove album reference from images (set to null)
    await GalleryImage.updateMany({ album: album._id }, { $set: { album: null } }).exec();

    // Delete album
    await GalleryAlbum.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Album deleted and images detached' });
  } catch (err) {
    console.error('Error deleting album:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete album', error: err.message });
  }
});

// Delete gallery image by id (admin only)
router.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Accept firebaseUid from body, header, or query to be more flexible
    const firebaseUid = (req.body && req.body.firebaseUid) || req.headers['x-firebase-uid'] || req.query.firebaseUid;

    // Verify admin
    if (!firebaseUid) {
      console.error('Delete gallery: missing firebaseUid. id=', id);
      return res.status(401).json({ success: false, message: 'Authentication required (provide firebaseUid)' });
    }
    const User = require('../models/User');
    let user;
    try {
      user = await User.findOne({ firebaseUid });
    } catch (err) {
      console.error('Error querying user for firebaseUid', firebaseUid, err);
      return res.status(500).json({ success: false, message: 'Error verifying user', error: err.message });
    }
    console.log('Delete gallery request:', { id, firebaseUid, userId: user ? user._id : null, role: user ? user.role : null });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const image = await GalleryImage.findById(id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (err) {
      console.error('Cloudinary destroy error for', image.publicId, err);
      // continue to remove DB record even if cloudinary deletion fails
    }

  // Remove DB record (use findByIdAndDelete to avoid deprecated/absent document methods)
  await GalleryImage.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    const payload = { success: false, message: 'Failed to delete image' };
    if (process.env.NODE_ENV === 'development') payload.error = error.message;
    return res.status(500).json(payload);
  }
});

// Delete file from Cloudinary
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/_/g, '/'); // Convert back to proper format
    
    const result = await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
});

// Download gallery image (proxy) - force download from server
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await GalleryImage.findById(id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    // Fetch the remote image URL and stream it back with Content-Disposition
    const remoteUrl = image.url;
    const resp = await fetch(remoteUrl);
    if (!resp.ok) {
      console.error('Failed to fetch remote image', remoteUrl, resp.statusText);
      return res.status(502).json({ success: false, message: 'Failed to fetch image from storage' });
    }

    // Determine filename from image title or publicId
    const fallbackName = image.publicId ? image.publicId.split('/').pop() : `image-${id}`;
    // Try to extract extension from remote URL
    const urlPath = new URL(remoteUrl).pathname;
    const extMatch = urlPath.match(/\.(jpe?g|png|gif|webp|bmp|svg|pdf)(?:$|\?)/i);
    const ext = extMatch ? extMatch[1] : '';
    const filename = `${(image.title && image.title.trim()) ? image.title.replace(/[^a-z0-9.-_ ]/gi, '') : fallbackName}${ext ? `.${ext}` : ''}`;

    // Set headers
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const contentLength = resp.headers.get('content-length');
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream body
    const body = resp.body;
    if (!body) {
      return res.status(500).json({ success: false, message: 'No body in remote response' });
    }

    // resp.body may be a Node.js Readable (has pipe) or a Web ReadableStream (no pipe).
    // Handle both cases for compatibility with global fetch (Undici) and node-fetch.
    try {
      if (typeof body.pipe === 'function') {
        // Node.js Readable
        body.pipe(res);
      } else {
        // Web ReadableStream -> convert to Node Readable and pipe
        const { Readable } = require('stream');
        if (typeof Readable.fromWeb === 'function') {
          Readable.fromWeb(body).pipe(res);
        } else {
          // Fallback: iterate web stream and push to res
          const reader = body.getReader();
          const stream = new Readable({ read() {} });
          (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                stream.push(Buffer.from(value));
              }
              stream.push(null);
            } catch (e) {
              stream.destroy(e);
            }
          })();
          stream.pipe(res);
        }
      }
    } catch (err) {
      console.error('Error piping remote body to response', err);
      return res.status(500).json({ success: false, message: 'Failed to stream image' });
    }
  } catch (err) {
    console.error('Error proxying download for image id', req.params.id, err);
    return res.status(500).json({ success: false, message: 'Failed to download image' });
  }
});

module.exports = router;

