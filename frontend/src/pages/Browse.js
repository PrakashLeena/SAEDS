import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import BookCard from '../components/BookCard';
import api from '../services/api';
import { elibraryFolders } from '../data/elibrary';

// Constants
const CATEGORIES = ['All', 'A/L', 'O/L', 'Other'];
const SORT_OPTIONS = [
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'author', label: 'Author (A-Z)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'year', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' }
];

// Flatten sections utility (moved outside component)
const flattenSections = (folders) => {
  const sections = [];
  folders.forEach((f) => {
    f.children.forEach((c) => {
      if (c.sections?.length > 0) {
        c.sections.forEach((s) => 
          sections.push({ 
            folderId: s.id, 
            folderTitle: `${f.title} / ${c.title} / ${s.title}` 
          })
        );
      } else {
        sections.push({ 
          folderId: c.id, 
          folderTitle: `${f.title} / ${c.title}` 
        });
      }
    });
  });
  return sections;
};

// Memoized category button component
const CategoryButton = memo(({ category, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isSelected
        ? 'bg-primary-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {category}
  </button>
));

CategoryButton.displayName = 'CategoryButton';

// Memoized book section component
const BookSection = memo(({ section, books }) => {
  if (!books || books.length === 0) return null;
  
  return (
    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-3">
      <h3 className="text-sm font-semibold mb-2 text-gray-800">
        {section.folderTitle}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
});

BookSection.displayName = 'BookSection';

// Memoized search bar component
const SearchBar = memo(({ value, onChange, onClear }) => (
  <div className="mb-6">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search by title or author..."
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  </div>
));

SearchBar.displayName = 'SearchBar';

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize sections (only recalculate if elibraryFolders changes)
  const sections = useMemo(() => flattenSections(elibraryFolders), []);

  // Memoized book filtering and sorting
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }

    // Sort books
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'popular':
          return (b.downloads || 0) - (a.downloads || 0);
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategory, sortBy, books]);

  // Memoized books by section
  const booksBySection = useMemo(() => {
    return sections.map(section => ({
      section,
      books: filteredAndSortedBooks.filter(b => {
        const folderId = b.raw?.folderId || b.folderId;
        return folderId === section.folderId;
      })
    })).filter(item => item.books.length > 0);
  }, [sections, filteredAndSortedBooks]);

  // Memoized uncategorized books
  const uncategorizedBooks = useMemo(() => {
    return filteredAndSortedBooks.filter(b => 
      !b.raw?.folderId && !b.folderId
    );
  }, [filteredAndSortedBooks]);

  // Load books
  useEffect(() => {
    let mounted = true;
    
    const loadBooks = async () => {
      try {
        const res = await api.book.getAll();
        const list = res?.data || [];
        
        if (!mounted) return;
        
        // Map backend shape to UI shape
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

    loadBooks();
    return () => { mounted = false; };
  }, []);

  // Memoized event handlers
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  // Memoized results text
  const resultsText = useMemo(() => {
    const count = filteredAndSortedBooks.length;
    const plural = count !== 1 ? 's' : '';
    const categoryText = selectedCategory !== 'All' 
      ? ` in ${selectedCategory}` 
      : '';
    
    return (
      <>
        Showing <span className="font-semibold">{count}</span> book{plural}
        {categoryText && <span>{categoryText}</span>}
      </>
    );
  }, [filteredAndSortedBooks.length, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Books</h1>
          <p className="text-gray-600 text-sm">
            Explore our collection of {books.length} books
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
          />

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <CategoryButton
                    key={category}
                    category={category}
                    isSelected={selectedCategory === category}
                    onClick={() => handleCategoryChange(category)}
                  />
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
                onChange={handleSortChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">{resultsText}</p>
        </div>

        {/* Books grouped by folder */}
        {filteredAndSortedBooks.length > 0 ? (
          <div className="space-y-6">
            {booksBySection.map(({ section, books }) => (
              <BookSection
                key={section.folderId}
                section={section}
                books={books}
              />
            ))}

            {/* Uncategorized books */}
            {uncategorizedBooks.length > 0 && (
              <div className="bg-white rounded-md border border-gray-100 shadow-sm p-3">
                <h3 className="text-sm font-semibold mb-2">Uncategorized</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                  {uncategorizedBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No books found. Use the Admin panel to add books or upload files to the E-Library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;