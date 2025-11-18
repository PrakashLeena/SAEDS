const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ElibraryFolder = require('../models/ElibraryFolder');
const ElibraryFile = require('../models/ElibraryFile');
const cloudinary = require('../config/cloudinary');
const { ensureDefaultFolders, buildTree, collectDescendants } = require('../utils/elibraryFolders');

async function requireAdmin(firebaseUid) {
  if (!firebaseUid) return null;
  const user = await User.findOne({ firebaseUid });
  if (!user || user.role !== 'admin') return null;
  return user;
}

router.get('/folders', async (req, res) => {
  try {
    await ensureDefaultFolders();
    const folders = await ElibraryFolder.find({});
    const tree = buildTree(folders);
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('Failed to fetch e-library folders', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-library folders',
      error: error.message,
    });
  }
});

router.post('/folders', async (req, res) => {
  try {
    const { firebaseUid, title, description = '', parentId = null } = req.body || {};
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const user = await requireAdmin(firebaseUid);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const folder = new ElibraryFolder({
      title: title.trim(),
      description: description.trim(),
      parentId: parentId || null,
      createdBy: user._id,
    });
    await folder.save();

    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    console.error('Failed to create folder', error);
    res.status(500).json({ success: false, message: 'Failed to create folder', error: error.message });
  }
});

router.put('/folders/:id', async (req, res) => {
  try {
    const { firebaseUid, title, description } = req.body || {};
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const user = await requireAdmin(firebaseUid);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const folder = await ElibraryFolder.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: (description || '').trim(),
      },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    res.json({ success: true, data: folder });
  } catch (error) {
    console.error('Failed to update folder', error);
    res.status(500).json({ success: false, message: 'Failed to update folder', error: error.message });
  }
});

router.delete('/folders/:id', async (req, res) => {
  try {
    const firebaseUid = req.body?.firebaseUid || req.query.firebaseUid || req.headers['x-firebase-uid'];
    const user = await requireAdmin(firebaseUid);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const folders = await ElibraryFolder.find({});
    const folderIds = collectDescendants(folders, req.params.id);

    const files = await ElibraryFile.find({ folderId: { $in: folderIds } });
    for (const file of files) {
      if (file.publicId) {
        try {
          await cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' });
        } catch (err) {
          console.error('Failed to delete cloudinary asset', file.publicId, err.message);
        }
      }
    }
    await ElibraryFile.deleteMany({ folderId: { $in: folderIds } });
    await ElibraryFolder.deleteMany({ _id: { $in: folderIds } });

    res.json({ success: true, message: 'Folder and contents deleted' });
  } catch (error) {
    console.error('Failed to delete folder', error);
    res.status(500).json({ success: false, message: 'Failed to delete folder', error: error.message });
  }
});

module.exports = router;

