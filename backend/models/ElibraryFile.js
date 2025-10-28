const mongoose = require('mongoose');

const ElibraryFileSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  folderId: { type: String, required: true }, // e.g. 'al-past-maths'
  folderTitle: { type: String, default: '' },
  fileType: { type: String, default: 'pdf' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ElibraryFile', ElibraryFileSchema);
