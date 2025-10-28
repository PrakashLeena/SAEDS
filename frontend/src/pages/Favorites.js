import React, { useEffect, useState } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Favorites = () => {
  const { currentUser } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          setFavoriteBooks([]);
          return;
        }

        // Fetch backend user by Firebase UID to get favorites list
        const ures = await api.user.getByFirebaseUid(currentUser.uid);
        const user = ures && ures.data ? ures.data : null;
        const favs = (user && Array.isArray(user.favorites)) ? user.favorites : [];

        if (favs.length === 0) {
          setFavoriteBooks([]);
          return;
        }

        // favorites may be populated (objects) or just IDs (strings)
        const booksToSet = [];
        const idsToFetch = [];
        favs.forEach((f) => {
          if (!f) return;
          // if populated object with _id or id and other fields, use it directly
          if (typeof f === 'object') {
            const bookObj = f._doc ? f._doc : f; // in case Mongoose returned a document
            // normalize to have both _id and id
            if (bookObj._id && !bookObj.id) bookObj.id = bookObj._id;
            if (bookObj.id && !bookObj._id) bookObj._id = bookObj.id;
            booksToSet.push(bookObj);
          } else {
            // assume it's an id string
            idsToFetch.push(String(f));
          }
        });

        if (idsToFetch.length > 0) {
          const bookPromises = idsToFetch.map((id) => api.book.getById(id).catch((e) => { console.error('Failed to fetch book', id, e); return null; }));
          const fetched = await Promise.all(bookPromises);
          const validFetched = fetched.filter(b => b && b.success && b.data).map(b => {
            const bd = b.data;
            if (bd._id && !bd.id) bd.id = bd._id;
            if (bd.id && !bd._id) bd._id = bd.id;
            return bd;
          });
          booksToSet.push(...validFetched);
        }

        setFavoriteBooks(booksToSet);
      } catch (err) {
        console.error('Failed to load favorites', err);
        setFavoriteBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen for global profile-updated events to refresh favorites in-place
    const onProfileUpdated = (e) => {
      const updated = e && e.detail ? e.detail : null;
      if (!updated) return;
      if (!Array.isArray(updated.favorites)) return;
      // reuse logic: if favorites are populated, set them; otherwise, reload
      const favs = updated.favorites;
      const booksToSet = [];
      const idsToFetch = [];
      favs.forEach((f) => {
        if (!f) return;
        if (typeof f === 'object') {
          const bookObj = f._doc ? f._doc : f;
          if (bookObj._id && !bookObj.id) bookObj.id = bookObj._id;
          if (bookObj.id && !bookObj._id) bookObj._id = bookObj.id;
          booksToSet.push(bookObj);
        } else {
          idsToFetch.push(String(f));
        }
      });
      if (idsToFetch.length === 0) {
        setFavoriteBooks(booksToSet);
        return;
      }
      // fetch remaining ids
      Promise.all(idsToFetch.map((id) => api.book.getById(id).catch(() => null)))
        .then((resArr) => {
          const valid = resArr.filter(r => r && r.success && r.data).map(r => r.data);
          valid.forEach(bd => { if (bd._id && !bd.id) bd.id = bd._id; if (bd.id && !bd._id) bd._id = bd.id; });
          setFavoriteBooks([...booksToSet, ...valid]);
        })
        .catch((e) => console.error('Failed to refresh favorites after profile update', e));
    };
    window.addEventListener('profile-updated', onProfileUpdated);
    return () => window.removeEventListener('profile-updated', onProfileUpdated);
  }, [currentUser]);

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

        {/* Favorites Grid */}
        {loading ? (
          <div>Loading favorites...</div>
        ) : favoriteBooks.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                You have <span className="font-semibold">{favoriteBooks.length}</span> favorite book
                {favoriteBooks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteBooks.map((book) => (
                <BookCard key={book._id || book.id} book={book} />
              ))}
            </div>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Favorites;
