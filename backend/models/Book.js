const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  pages: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  reads: {
    type: Number,
    default: 0,
  },
  publishedYear: {
    type: Number,
  },
  isbn: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  // Optional folder metadata to categorize books (e.g., 'al-past-maths')
  folderId: { type: String, default: '' },
  folderTitle: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Book', bookSchema);
