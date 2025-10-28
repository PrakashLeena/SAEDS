import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Download, BookOpen, Calendar, FileText, Globe, Heart, Share2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const viewerRef = React.useRef(null);
  const [viewerUrl, setViewerUrl] = useState('');
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { currentUser } = useAuth();
  const [backendUser, setBackendUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
  const res = await api.book.getById(id);
  if (!mounted) return;
  const b = res.data || {};
  // Normalize fields expected by the UI
  b.year = b.publishedYear || (b.createdAt ? new Date(b.createdAt).getFullYear() : '');
  b.pages = b.pages || 0;
  b.downloads = b.downloads || 0;
  b.rating = b.rating || 0;
  b.available = Boolean(b.pdfUrl || b.coverImage);
  setBook(b);
      // load stats
      try {
            const statsRes = await api.book.getStats(id);
            if (mounted && statsRes && statsRes.data) {
              setDownloadsCount(statsRes.data.downloads || 0);
              setFavoritesCount(statsRes.data.favoritesCount || 0);
            }
      } catch (e) {
        console.error('Failed to load book stats', e);
      }
      } catch (err) {
        console.error('Failed to load book:', err);
        setError('Book not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  // If user is signed in, fetch backend user document to enable favorites API
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      if (!currentUser) return;
      try {
        const res = await api.user.getByFirebaseUid(currentUser.uid);
        if (!mounted) return;
        if (res && res.data) {
          setBackendUser(res.data);
          // check if book is in favorites
          if (Array.isArray(res.data.favorites) && book) {
            const has = res.data.favorites.some(f => (f._id ? f._id === book._id : f === book._id || f === id));
            setIsFavorite(has);
          }
        }
      } catch (err) {
        console.error('Failed to load backend user', err);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, [currentUser, book, id]);

  if (loading) return <div className="min-h-screen p-6">Loading...</div>;
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h2>
          <Link to="/browse" className="text-primary-600 hover:text-primary-700">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // relatedBooks left empty for now; could fetch and filter by category
  const relatedBooks = [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="relative mb-6">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg"
                />
                {book.available ? (
                  <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Available
                  </span>
                ) : (
                  <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Unavailable
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    // resolve pdf url (book.pdfUrl or associated elibrary file)
                    let url = book.pdfUrl || '';
                    if (!url) {
                      try {
                        const f = await api.book.getFile(id);
                        if (f && f.data && f.data.url) url = f.data.url;
                      } catch (err) {
                        console.error('No file found for download', err);
                      }
                    }
                    if (!url) return;

                    try {
                      const dlRes = await api.book.incrementDownload(book._id || id, { firebaseUid: currentUser ? currentUser.uid : undefined });
                      // refresh stats count
                      const statsRes = await api.book.getStats(id);
                      if (statsRes && statsRes.data) setDownloadsCount(statsRes.data.downloads || 0);
                      // update backend user and notify Profile to refresh
                      if (currentUser) {
                        try {
                          const ru = await api.user.getByFirebaseUid(currentUser.uid);
                          if (ru && ru.data) {
                            // dispatch global event so Profile component can refresh
                            window.dispatchEvent(new CustomEvent('profile-updated', { detail: ru.data }));
                          }
                        } catch (e) { console.error('Failed to refresh backend user after download', e); }
                      }
                    } catch (err) {
                      console.error('Failed to increment download count', err);
                    }

                    try {
                      const a = document.createElement('a');
                      a.href = url;
                      a.target = '_blank';
                      a.rel = 'noopener';
                      a.download = '';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    } catch (err) {
                      window.open(url, '_blank', 'noopener');
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
                    book.pdfUrl || true
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={async () => {
                    // resolve pdf url
                    let url = book.pdfUrl || '';
                    if (!url) {
                      try {
                        const f = await api.book.getFile(id);
                        if (f && f.data && f.data.url) url = f.data.url;
                      } catch (err) {
                        console.error('No file found for reading', err);
                      }
                    }
                    if (!url) return;
                      // mark as read (update book.reads and user's booksRead)
                      try {
                        await api.book.markRead(book._id || id, { firebaseUid: currentUser ? currentUser.uid : undefined });
                        // refresh stats
                        const statsRes = await api.book.getStats(id);
                        if (statsRes && statsRes.data) {
                          setDownloadsCount(statsRes.data.downloads || 0);
                          setFavoritesCount(statsRes.data.favoritesCount || 0);
                        }
                      } catch (err) {
                        console.error('Failed to mark read', err);
                      }
                      setViewerUrl(url);
                      setShowViewer(true);
                    // scroll viewer into view after render
                    setTimeout(() => {
                      if (viewerRef.current) viewerRef.current.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
                    book.pdfUrl || true
                      ? 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Read Online</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                          let userId = backendUser && backendUser._id;
                          if (!userId) {
                            // try to fetch backend user quickly
                            if (!currentUser) return navigate('/signin');
                            try {
                              const ru = await api.user.getByFirebaseUid(currentUser.uid);
                              if (ru && ru.data) {
                                setBackendUser(ru.data);
                                userId = ru.data._id;
                              } else {
                                console.error('No backend user for firebase uid');
                                return;
                              }
                            } catch (e) { console.error(e); return; }
                          }
                          try {
                            if (!isFavorite) {
                              await api.user.addFavorite(userId, id);
                            } else {
                              await api.user.removeFavorite(userId, id);
                            }
                        setIsFavorite(!isFavorite);
                        // refresh favorites count
                        const statsRes = await api.book.getStats(id);
                        if (statsRes && statsRes.data) setFavoritesCount(statsRes.data.favoritesCount || 0);
              // refresh backend user and notify Profile
              if (currentUser) {
                try {
                const ru = await api.user.getByFirebaseUid(currentUser.uid);
                if (ru && ru.data) window.dispatchEvent(new CustomEvent('profile-updated', { detail: ru.data }));
                } catch (e) { console.error('Failed to refresh backend user after favorite toggle', e); }
              }
                      } catch (err) {
                        console.error('Failed to toggle favorite', err);
                      }
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
                      isFavorite
                        ? 'bg-red-50 border-2 border-red-500 text-red-500'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{isFavorite ? 'Saved' : 'Save'}</span>
                  </button>

                  <button className="py-3 px-4 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-primary-600 hover:text-primary-600 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(book.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-semibold text-gray-700">
                      {book.rating}
                    </span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">
                    { (downloadsCount || book.downloads || 0).toLocaleString() } downloads
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{(favoritesCount || 0).toLocaleString()} favorites</span>
                </div>

                <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {book.category}
                </span>
              </div>

              {/* Book Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="font-semibold text-gray-900">{book.year}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Pages</p>
                    <p className="font-semibold text-gray-900">{book.pages}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Globe className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="font-semibold text-gray-900">{book.language}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <BookOpen className="h-5 w-5 text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="font-semibold text-gray-900 text-xs">{book.isbn}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this book</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>

              {/* Related Books */}
              {relatedBooks.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Books</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedBooks.map((relatedBook) => (
                      <Link
                        key={relatedBook.id}
                        to={`/book/${relatedBook.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        <img
                          src={relatedBook.coverImage}
                          alt={relatedBook.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {relatedBook.title}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{relatedBook.author}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{relatedBook.rating}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
              {/* PDF Viewer (in-page) */}
              {showViewer && viewerUrl && (
                <div ref={viewerRef} className="mt-6">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Reading: {book.title}</h3>
                      <div className="space-x-2">
                        <button
                          onClick={() => setShowViewer(false)}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Close
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api.book.incrementDownload(book._id || id, { firebaseUid: currentUser ? currentUser.uid : undefined });
                              // notify profile
                              if (currentUser) {
                                try {
                                const ru = await api.user.getByFirebaseUid(currentUser.uid);
                                if (ru && ru.data) window.dispatchEvent(new CustomEvent('profile-updated', { detail: ru.data }));
                                } catch (e) { console.error(e); }
                              }
                            } catch (err) { console.error(err); }
                            window.open(viewerUrl, '_blank', 'noopener');
                          }}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          Open in new tab
                        </button>
                      </div>
                    </div>
                    <div className="w-full" style={{ minHeight: 400 }}>
                      <iframe
                        title={`reader-${book._id || id}`}
                        src={viewerUrl}
                        className="w-full h-[70vh] border"
                      />
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
