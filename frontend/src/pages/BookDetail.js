import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Download, BookOpen, Calendar, FileText, Globe, Heart, Share2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PDF_REGEX = /\.pdf(\?.*)?$/i;

// Memoized star rating component
const StarRating = memo(({ rating }) => (
  <div className="flex items-center space-x-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))}
    <span className="ml-2 text-lg font-semibold text-gray-700">
      {rating}
    </span>
  </div>
));

StarRating.displayName = 'StarRating';

// Memoized book info item component
const BookInfoItem = memo(({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-2">
    <Icon className="h-5 w-5 text-primary-600 mt-1" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`font-semibold text-gray-900 ${label === 'ISBN' ? 'text-xs' : ''}`}>
        {value}
      </p>
    </div>
  </div>
));

BookInfoItem.displayName = 'BookInfoItem';

// Memoized PDF viewer component
const PDFViewer = memo(({ book, viewerUrl, onClose, onOpenNewTab, viewerRef }) => (
  <div ref={viewerRef} className="mt-6">
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Reading: {book.title}</h3>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onOpenNewTab}
            className="text-sm text-primary-600 hover:underline"
          >
            Open in new tab
          </button>
        </div>
      </div>
      <div className="w-full" style={{ minHeight: 400 }}>
        <iframe
          title={`reader-${book._id}`}
          src={viewerUrl}
          className="w-full h-[70vh] border"
        />
      </div>
    </div>
  </div>
));

PDFViewer.displayName = 'PDFViewer';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [backendUser, setBackendUser] = useState(null);
  
  const viewerRef = useRef(null);
  const urlCacheRef = useRef(null);

  // Memoized book info
  const bookInfo = useMemo(() => {
    if (!book) return [];
    return [
      { icon: Calendar, label: 'Published', value: book.year },
      { icon: FileText, label: 'Pages', value: book.pages },
      { icon: Globe, label: 'Language', value: book.language },
      { icon: BookOpen, label: 'ISBN', value: book.isbn }
    ];
  }, [book]);

  // Shared function to resolve PDF URL
  const resolvePdfUrl = useCallback(async () => {
    if (urlCacheRef.current) return urlCacheRef.current;
    
    try {
      const f = await api.book.getFile(id);
      if (f?.data?.fileId) {
        const proxyUrl = api.elibrary.downloadUrl(f.data.fileId);
        urlCacheRef.current = proxyUrl;
        return proxyUrl;
      }
      if (f?.data?.url && PDF_REGEX.test(f.data.url)) {
        urlCacheRef.current = f.data.url;
        return f.data.url;
      }
    } catch (err) {
      console.error('No file found', err);
    }
    
    if (book?.pdfUrl && PDF_REGEX.test(book.pdfUrl)) {
      urlCacheRef.current = book.pdfUrl;
      return book.pdfUrl;
    }
    
    return null;
  }, [book?.pdfUrl, id]);

  // Shared function to refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const ru = await api.user.getByFirebaseUid(currentUser.uid);
      if (ru?.data) {
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: ru.data }));
      }
    } catch (e) {
      console.error('Failed to refresh user profile', e);
    }
  }, [currentUser]);

  // Shared function to refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const statsRes = await api.book.getStats(id);
      if (statsRes?.data) {
        setDownloadsCount(statsRes.data.downloads || 0);
        setFavoritesCount(statsRes.data.favoritesCount || 0);
      }
    } catch (e) {
      console.error('Failed to refresh stats', e);
    }
  }, [id]);

  // Load book data
  useEffect(() => {
    let mounted = true;
    
    const loadBook = async () => {
      try {
        const res = await api.book.getById(id);
        if (!mounted) return;
        
        const b = res.data || {};
        b.year = b.publishedYear || (b.createdAt ? new Date(b.createdAt).getFullYear() : '');
        b.pages = b.pages || 0;
        b.downloads = b.downloads || 0;
        b.rating = b.rating || 0;
        b.available = Boolean(b.pdfUrl || b.coverImage);
        
        setBook(b);
        
        // Load stats
        try {
          const statsRes = await api.book.getStats(id);
          if (mounted && statsRes?.data) {
            setDownloadsCount(statsRes.data.downloads || 0);
            setFavoritesCount(statsRes.data.favoritesCount || 0);
          }
        } catch (e) {
          console.error('Failed to load book stats', e);
        }
      } catch (err) {
        console.error('Failed to load book:', err);
        if (mounted) setError('Book not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadBook();
    return () => { mounted = false; };
  }, [id]);

  // Load user data and check favorites
  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      if (!currentUser) return;
      
      try {
        const res = await api.user.getByFirebaseUid(currentUser.uid);
        if (!mounted) return;
        
        if (res?.data) {
          setBackendUser(res.data);
          
          if (Array.isArray(res.data.favorites) && book) {
            const has = res.data.favorites.some(f => 
              (f._id ? f._id === book._id : f === book._id || f === id)
            );
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

  // Handle download
  const handleDownload = useCallback(async () => {
    const url = await resolvePdfUrl();
    if (!url) return;

    try {
      await api.book.incrementDownload(book._id || id, { 
        firebaseUid: currentUser?.uid 
      });
      
      await Promise.all([
        refreshStats(),
        refreshUserProfile()
      ]);
    } catch (err) {
      console.error('Failed to increment download count', err);
    }

    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `${book.title}.pdf`;
      a.click();
    } catch (err) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [book, id, currentUser, resolvePdfUrl, refreshStats, refreshUserProfile]);

  // Handle read online
  const handleReadOnline = useCallback(async () => {
    const url = await resolvePdfUrl();
    if (!url) return;

    try {
      await api.book.markRead(book._id || id, { 
        firebaseUid: currentUser?.uid 
      });
      await refreshStats();
    } catch (err) {
      console.error('Failed to mark read', err);
    }

    setViewerUrl(url);
    setShowViewer(true);
    
    setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, [book, id, currentUser, resolvePdfUrl, refreshStats]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async () => {
    let userId = backendUser?._id;
    
    if (!userId) {
      if (!currentUser) return navigate('/signin');
      
      try {
        const ru = await api.user.getByFirebaseUid(currentUser.uid);
        if (ru?.data) {
          setBackendUser(ru.data);
          userId = ru.data._id;
        } else {
          console.error('No backend user for firebase uid');
          return;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    }

    try {
      if (!isFavorite) {
        await api.user.addFavorite(userId, id);
      } else {
        await api.user.removeFavorite(userId, id);
      }
      
      setIsFavorite(!isFavorite);
      
      await Promise.all([
        refreshStats(),
        refreshUserProfile()
      ]);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  }, [backendUser, currentUser, isFavorite, id, navigate, refreshStats, refreshUserProfile]);

  // Handle viewer close
  const handleViewerClose = useCallback(() => {
    setShowViewer(false);
  }, []);

  // Handle open in new tab from viewer
  const handleOpenNewTab = useCallback(async () => {
    try {
      await api.book.incrementDownload(book._id || id, { 
        firebaseUid: currentUser?.uid 
      });
      await refreshUserProfile();
    } catch (err) {
      console.error(err);
    }
    
    window.open(viewerUrl, '_blank', 'noopener,noreferrer');
  }, [book, id, currentUser, viewerUrl, refreshUserProfile]);

  // Memoized stats display
  const statsDisplay = useMemo(() => {
    const downloads = downloadsCount || book?.downloads || 0;
    const favorites = favoritesCount || 0;
    
    return (
      <>
        <span className="text-gray-600">
          {downloads.toLocaleString()} downloads
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          {favorites.toLocaleString()} favorites
        </span>
      </>
    );
  }, [downloadsCount, favoritesCount, book?.downloads]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

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
                  loading="eager"
                  className="w-full rounded-lg shadow-lg"
                />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  book.available ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {book.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleReadOnline}
                  className="w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Read Online</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={handleFavoriteToggle}
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
                  <StarRating rating={book.rating} />
                  <span className="text-gray-400">|</span>
                  {statsDisplay}
                </div>

                <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {book.category}
                </span>
              </div>

              {/* Book Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
                {bookInfo.map((info, index) => (
                  <BookInfoItem
                    key={index}
                    icon={info.icon}
                    label={info.label}
                    value={info.value}
                  />
                ))}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this book</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            </div>

            {/* PDF Viewer */}
            {showViewer && viewerUrl && (
              <PDFViewer
                book={book}
                viewerUrl={viewerUrl}
                onClose={handleViewerClose}
                onOpenNewTab={handleOpenNewTab}
                viewerRef={viewerRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;