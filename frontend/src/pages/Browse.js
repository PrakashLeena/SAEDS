import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import api from '../services/api';
import { elibraryFolders } from '../data/elibrary';

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  

  // Derive category list from elibrary folder structure so category buttons
  // reflect the folder names and sections. Example entries:
  // 'GCE A/L', 'GCE A/L / Past Papers', 'GCE A/L / Past Papers / Maths'
  // Simplified top-level categories per user request: All, A/L, O/L, Other
  const categories = ['All', 'A/L', 'O/L', 'Other'];

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort books
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.year - a.year;
        case 'popular':
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, selectedCategory, sortBy, books]);

  // Build flat list of folder sections from elibraryFolders so we can
  // group books by the folder admin selected when creating the book.
  const flattenSections = (folders) => {
    const sections = [];
    folders.forEach((f) => {
      f.children.forEach((c) => {
        if (c.sections && c.sections.length > 0) {
          c.sections.forEach((s) => sections.push({ folderId: s.id, folderTitle: `${f.title} / ${c.title} / ${s.title}` }));
        } else {
          sections.push({ folderId: c.id, folderTitle: `${f.title} / ${c.title}` });
        }
      });
    });
    return sections;
  };

  const sections = flattenSections(elibraryFolders);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.book.getAll();
        const list = (res && res.data) ? res.data : [];
        if (!mounted) return;
        // map backend shape to UI shape expected by BookCard
        const mapped = list.map(b => ({
          id: b._id,
          title: b.title,
          author: b.author,
          category: b.category,
          description: b.description,
          coverImage: b.coverImage || '',
          pdfUrl: b.pdfUrl || '',
          pages: b.pages || 0,
          rating: b.rating || 0,
          year: b.publishedYear || (b.createdAt ? new Date(b.createdAt).getFullYear() : ''),
          downloads: b.downloads || 0,
          available: Boolean(b.pdfUrl || b.coverImage),
          raw: b,
        }));
        setBooks(mapped);
        
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
        <div className="text-gray-600">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Books</h1>
          <p className="text-gray-600 text-sm">Explore our collection of {books.length} books</p>
        </div>

  {/* Search and Filters */}
  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="title">Title (A-Z)</option>
                <option value="author">Author (A-Z)</option>
                <option value="rating">Highest Rated</option>
                <option value="year">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredAndSortedBooks.length}</span> book
            {filteredAndSortedBooks.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && (
              <span> in <span className="font-semibold">{selectedCategory}</span></span>
            )}
          </p>
        </div>
        {/* Books grouped by folder (as selected in Admin when creating a book) */}
        {filteredAndSortedBooks.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section) => {
              const sectionBooks = filteredAndSortedBooks.filter(b => (b.raw && b.raw.folderId ? b.raw.folderId : b.folderId) === section.folderId);
              if (!sectionBooks || sectionBooks.length === 0) return null;
              return (
                <div key={section.folderId} className="bg-white rounded-md border border-gray-100 shadow-sm p-3">
                  <h3 className="text-sm font-semibold mb-2 text-gray-800">{section.folderTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                    {sectionBooks.map(book => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Uncategorized books */}
            {filteredAndSortedBooks.filter(b => !(b.raw && b.raw.folderId) && !(b.folderId)).length > 0 && (
                <div className="bg-white rounded-md border border-gray-100 shadow-sm p-3">
                <h3 className="text-sm font-semibold mb-2">Uncategorized</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                  {filteredAndSortedBooks.filter(b => !(b.raw && b.raw.folderId) && !(b.folderId)).map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No books found. Use the Admin panel to add books or upload files to the E-Library.</p>
            <div className="mt-4">
              <Link to="/admin/books" className="text-primary-600 hover:underline">Go to Admin → Books</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
