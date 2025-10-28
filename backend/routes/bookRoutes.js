const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const ElibraryFile = require('../models/ElibraryFile');

// Get all books with optional filters
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/books called with query:', req.query);
    const { category, search, sort } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    let booksQuery = Book.find(query);

    // Sort
    if (sort === 'popular') {
      booksQuery = booksQuery.sort({ downloads: -1 });
    } else if (sort === 'rating') {
      booksQuery = booksQuery.sort({ rating: -1 });
    } else if (sort === 'recent') {
      booksQuery = booksQuery.sort({ createdAt: -1 });
    } else {
      booksQuery = booksQuery.sort({ title: 1 });
    }

    const books = await booksQuery;
  console.log(`GET /api/books returning ${books.length} books`);

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message,
    });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message,
    });
  }
});

// Create new book
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/books payload:', req.body);
    const book = await Book.create(req.body);
    console.log('Book created with id:', book._id);

    // If the created book includes a PDF and a folder selection, also create
    // an ElibraryFile record so it appears in the E-Library section which
    // lists files from the ElibraryFile collection.
    try {
      const folderId = req.body.folderId || book.folderId || null;
      const folderTitle = req.body.folderTitle || book.folderTitle || '';
      const pdfUrl = req.body.pdfUrl || book.pdfUrl || '';
      if (folderId && pdfUrl) {
        const ElibraryFile = require('../models/ElibraryFile');
        const fileDoc = new ElibraryFile({
          title: book.title || 'Untitled',
          description: book.description || '',
          url: pdfUrl,
          publicId: '',
          uploadedBy: null,
          folderId,
          folderTitle,
          fileType: 'pdf',
        });
        await fileDoc.save();
        console.log('Created ElibraryFile for book id', book._id, 'file id', fileDoc._id);
      }
    } catch (err) {
      console.error('Failed to create ElibraryFile for book:', err);
    }

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error('Error in POST /api/books:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message,
    });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message,
    });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message,
    });
  }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const inc = { $inc: { downloads: 1 } };
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      inc,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // If firebaseUid provided, increment user's downloads stat as well
    const firebaseUid = (req.body && req.body.firebaseUid) || req.headers['x-firebase-uid'];
    let userDownloads = null;
    if (firebaseUid) {
      try {
        const user = await User.findOne({ firebaseUid });
        if (user) {
          user.downloads = (user.downloads || 0) + 1;
          await user.save();
          userDownloads = user.downloads;
        }
      } catch (e) {
        console.error('Failed to update user downloads count', e);
      }
    }

    res.json({
      success: true,
      data: book,
      userDownloads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating download count',
      error: error.message,
    });
  }
});

// Mark a book as read (increment book.reads and user's booksRead)
router.post('/:id/read', async (req, res) => {
  try {
    const firebaseUid = (req.body && req.body.firebaseUid) || req.headers['x-firebase-uid'];

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $inc: { reads: 1 } },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (firebaseUid) {
      try {
        const user = await User.findOne({ firebaseUid });
        if (user) {
          user.booksRead = (user.booksRead || 0) + 1;
          await user.save();
        }
      } catch (e) {
        console.error('Failed to update user booksRead', e);
      }
    }

    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking book read', error: error.message });
  }
});

// Get book stats (downloads and favorites count)
router.get('/:id/stats', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const favoritesCount = await User.countDocuments({ favorites: req.params.id });

    res.json({ success: true, data: { downloads: book.downloads || 0, favoritesCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching book stats', error: error.message });
  }
});

// Find associated e-library file for a book (if book.pdfUrl missing)
router.get('/:id/file', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // If book has direct pdfUrl, return it
    if (book.pdfUrl) {
      return res.json({ success: true, data: { url: book.pdfUrl } });
    }

    // Try to find a matching ElibraryFile by title and folderId if available
    const titleRegex = book.title ? new RegExp(book.title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i') : null;
    const filter = {};
    if (book.folderId) filter.folderId = book.folderId;
    if (titleRegex) filter.title = { $regex: titleRegex };

    let file = null;
    if (Object.keys(filter).length > 0) {
      file = await ElibraryFile.findOne(filter).sort({ createdAt: -1 }).exec();
    }

    // As a fallback, try any file with a matching title
    if (!file && titleRegex) {
      file = await ElibraryFile.findOne({ title: { $regex: titleRegex } }).sort({ createdAt: -1 }).exec();
    }

    if (!file) return res.status(404).json({ success: false, message: 'No file found for this book' });

    res.json({ success: true, data: { url: file.url, fileId: file._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error finding file for book', error: error.message });
  }
});

// Get book categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Book.distinct('category');

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
});

module.exports = router;
