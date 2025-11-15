import React, { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, BookOpen } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookCard = memo(({ book }) => {
  const { currentUser } = useAuth();
  
  // Memoize user UID to prevent unnecessary re-renders
  const userUid = useMemo(() => currentUser?.uid, [currentUser]);
  
  // Memoize availability status
  const availabilityBadge = useMemo(() => (
    book.available ? (
      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
        Available
      </div>
    ) : (
      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
        Unavailable
      </div>
    )
  ), [book.available]);

  // Optimize URL resolution - cache the result
  const resolveBookUrl = useCallback(async () => {
    if (book.pdfUrl) return book.pdfUrl;
    
    try {
      const f = await api.book.getFile(book.id);
      return f?.data?.url || null;
    } catch (err) {
      console.error('No file found', err);
      return null;
    }
  }, [book.id, book.pdfUrl]);

  // Optimized read handler
  const handleRead = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = await resolveBookUrl();
    
    if (!url) {
      window.location.href = `/book/${book.id}`;
      return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [resolveBookUrl, book.id]);

  // Optimized download handler
  const handleDownload = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = await resolveBookUrl();
    if (!url) return;
    
    // Run download increment and file download in parallel
    const downloadPromises = [];
    
    // Increment download count
    downloadPromises.push(
      api.book.incrementDownload(book.id, { 
        firebaseUid: userUid 
      }).catch(err => console.error('Failed to increment download', err))
    );
    
    // Refresh user profile if authenticated
    if (userUid) {
      downloadPromises.push(
        api.user.getByFirebaseUid(userUid)
          .then(ru => {
            if (ru?.data) {
              window.dispatchEvent(new CustomEvent('profile-updated', { 
                detail: ru.data 
              }));
            }
          })
          .catch(e => console.error('Failed to refresh user', e))
      );
    }
    
    // Execute API calls in parallel (non-blocking)
    Promise.all(downloadPromises);
    
    // Trigger download immediately (don't wait for API)
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${book.title}.pdf`;
    a.click();
  }, [resolveBookUrl, book.id, book.title, userUid]);

  // Memoize download count display
  const downloadCount = useMemo(() => 
    (book.downloads || 0).toLocaleString(),
    [book.downloads]
  );

  return (
    <div className="bg-white rounded-md border border-gray-100 overflow-hidden hover:shadow-lg transition transform duration-150 hover:-translate-y-1 group">
      <Link to={`/book/${book.id}`}>
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <img
            src={book.coverImage}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {availabilityBadge}
        </div>
      </Link>
      
      <div className="p-2">
        <Link to={`/book/${book.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5 hover:text-primary-600 transition-colors line-clamp-1">
            {book.title}
          </h3>
        </Link>
        <p className="text-[11px] text-gray-600 mb-1">{book.author}</p>
        
        <div className="flex items-center justify-between mb-1">
          <span className="inline-block bg-primary-100 text-primary-800 text-[10px] px-2 py-0.5 rounded">
            {book.category}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-[11px] font-medium text-gray-700">{book.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span>{book.pages} pages</span>
          <span>{book.year}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRead}
            className="flex-1 bg-white border border-primary-600 text-primary-600 py-1 px-2 rounded-md hover:bg-primary-50 transition-all text-center text-[12px] font-medium flex items-center justify-center space-x-1"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Read</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-all"
            title="Download PDF"
            aria-label="Download PDF"
          >
            <Download className="h-4 w-4 text-gray-600 hover:text-primary-600 transition-colors" />
          </button>
        </div>

        <div className="mt-1 flex items-center text-[11px] text-gray-500">
          <Download className="h-3 w-3 mr-1" />
          <span>{downloadCount} downloads</span>
        </div>
      </div>
    </div>
  );
});

BookCard.displayName = 'BookCard';

export default BookCard;