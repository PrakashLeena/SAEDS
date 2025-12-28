const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const ElibraryFile = require('../models/ElibraryFile');
const cloudinary = require('../config/cloudinary');
const fetch = global.fetch || require('node-fetch');

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
      // Only create an E-Library file for PDFs — ensure file is pdf
      if (folderId && pdfUrl && isPdfUrl(pdfUrl)) {
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
      } else if (folderId && pdfUrl) {
        console.warn('Skipping creation of ElibraryFile — pdfUrl is not a PDF: ', pdfUrl);
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
    // Find book to check which file we are about to count as a download
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Only allow downloads if we can find a PDF — either book.pdfUrl or an ElibraryFile
    let pdfFound = false;
    if (book.pdfUrl && isPdfUrl(book.pdfUrl)) {
      pdfFound = true;
    } else {
      // Try to find an associated ElibraryFile that's a PDF
      const titleRegex = book.title ? new RegExp(book.title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i') : null;
      const filter = {};
      if (book.folderId) filter.folderId = book.folderId;
      if (titleRegex) filter.title = { $regex: titleRegex };

      if (Object.keys(filter).length > 0) {
        const file = await ElibraryFile.findOne({
          ...filter,
          $or: [
            { fileType: { $regex: /pdf/i } },
            { url: { $regex: /\.pdf(\?.*)?$/i } },
          ],
        }).sort({ createdAt: -1 }).exec();
        if (file) pdfFound = true;
      }
    }

    if (!pdfFound) {
      // Prevent counting non-PDF downloads — enforce PDF-only downloads
      return res.status(400).json({ success: false, message: 'Only PDF downloads are allowed for this book' });
    }

    // At this point it's a PDF — increment the download count
    const inc = { $inc: { downloads: 1 } };
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, inc, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
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

    res.json({ success: true, data: updatedBook, userDownloads });
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

    // Try to find a matching ElibraryFile by title and folderId if available
    const titleRegex = book.title ? new RegExp(book.title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i') : null;
    const filter = {};
    if (book.folderId) filter.folderId = book.folderId;
    if (titleRegex) filter.title = { $regex: titleRegex };

    let file = null;
    if (Object.keys(filter).length > 0) {
      // Ensure only pdf files are matched
      file = await ElibraryFile.findOne({
        ...filter,
        $or: [
          { fileType: { $regex: /pdf/i } },
          { url: { $regex: /\.pdf(\?.*)?$/i } },
        ],
      }).sort({ createdAt: -1 }).exec();
    }

    // As a fallback, try any file with a matching title
    if (!file && titleRegex) {
      // Try any file with a matching title but restrict to PDFs
      file = await ElibraryFile.findOne({
        title: { $regex: titleRegex },
        $or: [
          { fileType: { $regex: /pdf/i } },
          { url: { $regex: /\.pdf(\?.*)?$/i } },
        ],
      }).sort({ createdAt: -1 }).exec();
    }

    if (!file && book.pdfUrl) {
      file = await ensureElibraryFileForBook(book);
    }

    if (file) {
      return res.json({ success: true, data: { url: file.url, fileId: file._id, fileType: file.fileType || 'application/pdf' } });
    }

    if (book.pdfUrl && isPdfUrl(book.pdfUrl)) {
      return res.json({ success: true, data: { url: book.pdfUrl, fileType: 'application/pdf' } });
    }

    return res.status(404).json({ success: false, message: 'No PDF found for this book' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error finding file for book', error: error.message });
  }
});

// Helper to check if a url looks like a PDF
function isPdfUrl(url) {
  if (!url || typeof url !== 'string') return false;
  // Allow any non-empty string to support external links (Google Drive, etc.)
  return url.trim().length > 0;
}

async function ensureElibraryFileForBook(book) {
  try {
    if (!book.pdfUrl) return null;

    let existing = await ElibraryFile.findOne({ url: book.pdfUrl });
    if (existing) return existing;

    const folderId = book.folderId || `book-${book._id}`;
    const folderTitle = book.folderTitle || 'Books';
    const publicId = extractCloudinaryPublicId(book.pdfUrl) || `book-${book._id}`;

    const fileDoc = new ElibraryFile({
      title: book.title || 'Untitled',
      description: book.description || '',
      url: book.pdfUrl,
      publicId,
      uploadedBy: null,
      folderId,
      folderTitle,
      fileType: 'pdf',
    });

    await fileDoc.save();
    return fileDoc;
  } catch (err) {
    console.error('Failed to ensure e-library file for book:', book._id, err);
    return null;
  }
}

function extractCloudinaryPublicId(url) {
  try {
    const parsed = new URL(url);
    const uploadIdx = parsed.pathname.indexOf('/upload/');
    if (uploadIdx === -1) return null;
    let afterUpload = parsed.pathname.slice(uploadIdx + '/upload/'.length);
    afterUpload = afterUpload.replace(/^v\d+\//, '');
    return afterUpload.replace(/\.[^/.]+$/, '');
  } catch (err) {
    return null;
  }
}

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

// Proxy download endpoint to force file download
router.get('/:id/download-file', async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = req.query.firebaseUid;

    // 1. Find the book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send('Book not found');
    }

    // 2. Resolve the PDF URL
    let pdfUrl = null;
    if (book.pdfUrl && isPdfUrl(book.pdfUrl)) {
      pdfUrl = book.pdfUrl;
    } else {
      // Try to find associated ElibraryFile
      const titleRegex = book.title ? new RegExp(book.title.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i') : null;
      const filter = {};
      if (book.folderId) filter.folderId = book.folderId;
      if (titleRegex) filter.title = { $regex: titleRegex };

      if (Object.keys(filter).length > 0) {
        const file = await ElibraryFile.findOne({
          ...filter,
          $or: [
            { fileType: { $regex: /pdf/i } },
            { url: { $regex: /\.pdf(\?.*)?$/i } },
          ],
        }).sort({ createdAt: -1 }).exec();
        if (file) pdfUrl = file.url;
      }
    }

    if (!pdfUrl) {
      return res.status(404).send('PDF not found for this book');
    }

    // 3. Increment download stats
    await Book.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
    if (firebaseUid) {
      try {
        const User = require('../models/User');
        await User.findOneAndUpdate(
          { firebaseUid },
          { $inc: { downloads: 1 } }
        );
      } catch (e) {
        console.error('Failed to update user stats', e);
      }
    }

    // 4. Stream the PDF through the backend (no Cloudinary redirect)
    try {
      let fetchUrl = pdfUrl;

      // If this is a Cloudinary URL, generate a signed delivery URL to avoid 401s
      try {
        const urlObj = new URL(pdfUrl);
        if (urlObj.hostname.includes('res.cloudinary.com')) {
          const parts = urlObj.pathname.split('/').filter(Boolean);
          // Expected structure: /<cloud_name>/<resource_type>/upload/v<version>/<publicId>.<ext>
          const resourceType = parts[1] || 'raw';
          const uploadIdx = parts.indexOf('upload');
          if (uploadIdx !== -1 && parts[uploadIdx + 1]) {
            const afterUploadParts = parts.slice(uploadIdx + 2); // skip 'upload' and 'vNNN'
            const publicPath = afterUploadParts.join('/');
            const lastDot = publicPath.lastIndexOf('.');
            const publicId = lastDot !== -1 ? publicPath.slice(0, lastDot) : publicPath;
            const format = lastDot !== -1 ? publicPath.slice(lastDot + 1) : undefined;

            fetchUrl = cloudinary.url(publicId, {
              resource_type: resourceType,
              type: 'upload',
              format,
              sign_url: true,
              secure: true,
            });
          }
        }
      } catch (parseErr) {
        console.error('Failed to generate signed Cloudinary URL, falling back to direct URL', parseErr);
      }

      const resp = await fetch(fetchUrl);
      if (!resp.ok) {
        console.error('Failed to fetch PDF from storage', pdfUrl, resp.status, resp.statusText);
        return res.status(502).send('Failed to fetch file from storage');
      }

      // Create a safe filename with .pdf extension
      const safeTitle = (book.title || 'document').replace(/[^a-z0-9.-_ ]/gi, '');
      const filename = `${safeTitle || 'document'}.pdf`;

      // Get content type/length
      const contentType = resp.headers.get('content-type') || 'application/pdf';
      const contentLength = resp.headers.get('content-length');

      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');

      const body = resp.body;
      if (!body) {
        return res.status(500).send('No body in remote response');
      }

      // Handle Node.js Readable or Web ReadableStream
      if (typeof body.pipe === 'function') {
        // Node.js Readable (node-fetch v2)
        body.pipe(res);
      } else if (typeof body.getReader === 'function') {
        // Web ReadableStream (undici/global fetch)
        const { Readable } = require('stream');

        if (typeof Readable.fromWeb === 'function') {
          Readable.fromWeb(body).pipe(res);
        } else {
          const reader = body.getReader();
          const nodeStream = new Readable({
            async read() {
              try {
                const { done, value } = await reader.read();
                if (done) {
                  this.push(null);
                } else {
                  this.push(Buffer.from(value));
                }
              } catch (err) {
                this.destroy(err);
              }
            }
          });

          nodeStream.pipe(res);
        }
      } else {
        // Fallback: buffer the entire response
        const arrayBuffer = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.send(buffer);
      }

    } catch (err) {
      console.error('Error streaming PDF file:', err);
      if (!res.headersSent) {
        res.status(500).send('Failed to download file');
      }
    }

  } catch (error) {
    console.error('Download proxy error:', error);
    if (!res.headersSent) {
      res.status(500).send('Server error during download');
    }
  }
});

module.exports = router;
