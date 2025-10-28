const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'GalleryAlbum', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
