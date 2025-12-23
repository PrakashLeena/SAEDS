import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, FileText } from 'lucide-react';
import { bookAPI, uploadAPI } from '../../services/api';
import { elibraryFolders } from '../../data/elibrary';

const flattenSections = (folders) => {
  const sections = [];

  const pushSection = (id, titles) => {
    sections.push({
      folderId: id,
      folderTitle: titles.join(' / '),
    });
  };

  const traverseSection = (section, ancestors) => {
    const path = [...ancestors, section.title];
    if (section.subjects?.length) {
      section.subjects.forEach((subject) => {
        pushSection(subject.id, [...path, subject.title]);
      });
    } else {
      pushSection(section.id, path);
    }
  };

  const traverseNode = (node, ancestors = []) => {
    const path = [...ancestors, node.title];

    if (node.sections?.length) {
      node.sections.forEach((section) => traverseSection(section, path));
    }

    if (node.children?.length) {
      node.children.forEach((child) => traverseNode(child, path));
    }

    if (!node.sections?.length && !node.children?.length) {
      pushSection(node.id, path);
    }
  };

  folders.forEach((folder) => traverseNode(folder));
  return sections;
};

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    coverImage: '',
    pdfUrl: '',
    pages: 0,
    rating: 0,
    publishedYear: new Date().getFullYear(),
    isbn: '',
    tags: '',
    folderId: '',
    folderTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');

  useEffect(() => {
    setSections(flattenSections(elibraryFolders));
    if (isEdit) {
      (async () => {
        try {
          const { data } = await bookAPI.getById(id);
          setFormData({
            ...data,
            tags: data.tags?.join(', ') || '',
            folderId: data.folderId || '',
            folderTitle: data.folderTitle || '',
          });
          setSelectedFolder(data.folderId || '');
        } catch (error) {
          console.error('Error fetching book:', error);
          setError('Failed to load book data');
        }
      })();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingCover(true);
    setError('');

    try {
      const result = await uploadAPI.uploadBookCover(file);
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          coverImage: result.data.url,
        }));
        setSuccess('Cover image uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to upload cover image');
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      setError('Failed to upload cover image. Please try again.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF size should be less than 10MB');
      return;
    }

    setUploadingPDF(true);
    setError('');

    try {
      // 1. Get signature from backend
      const sigResult = await uploadAPI.getSignature('saeds/book-pdfs');
      if (!sigResult.success) throw new Error('Failed to get upload signature');

      // 2. Upload directly to Cloudinary
      const uploadResult = await uploadAPI.uploadDirect(file, sigResult);

      // 3. Update state with the returned URL
      setFormData((prev) => ({
        ...prev,
        pdfUrl: uploadResult.secure_url,
      }));
      setSuccess('PDF uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setUploadingPDF(false);
    }
  };

  const removeCover = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: '',
    }));
  };

  const removePDF = () => {
    setFormData((prev) => ({
      ...prev,
      pdfUrl: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookData = {
        ...formData,
        pages: parseInt(formData.pages) || 0,
        rating: parseFloat(formData.rating) || 0,
        publishedYear: parseInt(formData.publishedYear) || new Date().getFullYear(),
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        folderId: selectedFolder || formData.folderId || '',
        folderTitle: (sections.find(s => s.folderId === (selectedFolder || formData.folderId)) || {}).folderTitle || formData.folderTitle || '',
      };

      if (isEdit) {
        await bookAPI.update(id, bookData);
      } else {
        await bookAPI.create(bookData);
      }

      navigate('/admin/books');
    } catch (error) {
      console.error('Error saving book:', error);
      setError('Failed to save book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/books')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Books</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? 'Update book information' : 'Add a new book to the library'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter book title"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Author name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Fiction, Science, History"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Book description"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image *
              </label>

              {formData.coverImage ? (
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="h-48 w-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Cover image uploaded</p>
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{uploadingCover ? 'Uploading...' : 'Change Cover'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                        disabled={uploadingCover}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-medium">
                      {uploadingCover ? 'Uploading...' : 'Click to upload cover'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={uploadingCover}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}

              {/* Manual URL input */}
              <div className="mt-3">
                <label className="text-xs text-gray-600 mb-1 block">Or enter image URL:</label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/cover.webp"
                />
              </div>
            </div>

            {/* PDF Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book PDF (Optional)
              </label>

              {formData.pdfUrl ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">PDF uploaded successfully</p>
                        <a
                          href={formData.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-700 hover:underline"
                        >
                          View PDF
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <Upload className="h-4 w-4" />
                        <span>{uploadingPDF ? 'Uploading...' : 'Replace'}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePDFUpload}
                          className="hidden"
                          disabled={uploadingPDF}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removePDF}
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-medium">
                      {uploadingPDF ? 'Uploading PDF...' : 'Click to upload PDF'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePDFUpload}
                      className="hidden"
                      disabled={uploadingPDF}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF up to 100MB
                  </p>
                </div>
              )}

              {/* Manual URL input */}
              <div className="mt-3">
                <label className="text-xs text-gray-600 mb-1 block">Or enter PDF URL:</label>
                <input
                  type="url"
                  name="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/book.pdf"
                />
              </div>
            </div>

            {/* Pages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Pages
              </label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>

            {/* Published Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Year
              </label>
              <input
                type="number"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN (optional)
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="978-3-16-148410-0"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="classic, bestseller, award-winning"
              />
            </div>
          </div>

          {/* Folder / Section */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Folder / Section</label>
            <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
              <option value="">-- Select folder/section (optional) --</option>
              {sections.map(s => (
                <option key={s.folderId} value={s.folderId}>{s.folderTitle}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Optional: categorize this book into the E-Library folder structure.</p>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
