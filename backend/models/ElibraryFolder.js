const mongoose = require('mongoose');
const crypto = require('crypto');

const elibraryFolderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => crypto.randomUUID(),
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  parentId: {
    type: String,
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ElibraryFolder', elibraryFolderSchema);

