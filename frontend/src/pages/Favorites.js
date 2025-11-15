import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Memoized empty state component
const EmptyFavoritesState = memo(() => (
  <div className="text-center py-16 bg-white rounded-lg shadow-md">
    <div className="text-gray-400 mb-4">
      <Heart className="h-16 w-16 mx-auto" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
    <p className="text-gray-600 mb-6">
      Start adding books to your favorites to see them here
    </p>
    <Link
      to="/browse"
      className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
    >
      <BookOpen className="h-5 w-5" />
      <span>Browse Books</span>
    </Link>
  </div>
));

EmptyFavoritesState.displayName = 'EmptyFavoritesState';

// Memoized loading state
const LoadingState = memo(() => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
  </div>
));

LoadingState.displayName = 'LoadingState';

// Utility function to normalize book object (extracted to avoid duplication)
const normalizeBook = (book) => {
  if (!book) return null;
  const bookObj = book._doc || book;
  if (bookObj._id && !bookObj.id) bookObj.id = bookObj._id;
  if (bookObj.id && !bookObj._id) bookObj._id = bookObj.id;
  return bookObj;
};

// Utility function to process favorites array
const processFavorites = (favs) => {
  const booksToSet = [];
  const idsToFetch = [];
  
  favs.forEach((f) => {
    if (!f) return;
    if (typeof f === 'object') {
      const normalized = normalizeBook(f);
      if (normalized) booksToSet.push(normalized);
    } else {
      idsToFetch.push(String(f));
    }
  });
  
  return { booksToSet, idsToFetch };
};

// Optimized function to fetch books by IDs
const fetchBooksByIds = async (ids) => {
  if (ids.length === 0) return [];
  
  const bookPromises = ids.map((id) => 
    api.book.getById(id).catch((e) => {
      console.error('Failed to fetch book', id, e);
      return null;
    })
  );
  
  const fetched = await Promise.all(bookPromises);
  return fetched
    .filter(b => b?.success && b.data)
    .map(b => normalizeBook(b.data))
    .filter(Boolean);
};

const Favorites = () => {
  const { currentUser } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized load favorites function
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        setFavoriteBooks([]);
        return;
      }

      const ures = await api.user.getByFirebaseUid(currentUser.uid);
      const user = ures?.data;
      const favs = Array.isArray(user?.favorites) ? user.favorites : [];

      if (favs.length === 0) {
        setFavoriteBooks([]);
        return;
      }

      const { booksToSet, idsToFetch } = processFavorites(favs);
      const fetchedBooks = await fetchBooksByIds(idsToFetch);
      
      setFavoriteBooks([...booksToSet, ...fetchedBooks]);
    } catch (err) {
      console.error('Failed to load favorites', err);
      setFavoriteBooks([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Memoized profile update handler
  const handleProfileUpdated = useCallback(async (e) => {
    const updated = e?.detail;
    if (!updated || !Array.isArray(updated.favorites)) return;

    const { booksToSet, idsToFetch } = processFavorites(updated.favorites);
    
    if (idsToFetch.length === 0) {
      setFavoriteBooks(booksToSet);
      return;
    }

    try {
      const fetchedBooks = await fetchBooksByIds(idsToFetch);
      setFavoriteBooks([...booksToSet, ...fetchedBooks]);
    } catch (e) {
      console.error('Failed to refresh favorites after profile update', e);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    window.addEventListener('profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('profile-updated', handleProfileUpdated);
  }, [handleProfileUpdated]);

  // Memoized book count text
  const bookCountText = useMemo(() => {
    const count = favoriteBooks.length;
    return `You have ${count} favorite book${count !== 1 ? 's' : ''}`;
  }, [favoriteBooks.length]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-4xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">Books you've saved for later</p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : favoriteBooks.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold">{bookCountText}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteBooks.map((book) => (
                <BookCard key={book._id || book.id} book={book} />
              ))}
            </div>
          </>
        ) : (
          <EmptyFavoritesState />
        )}
      </div>
    </div>
  );
};

export default Favorites;