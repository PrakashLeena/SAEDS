import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, BookOpen } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookCard = ({ book }) => {
  const { currentUser } = useAuth();
  return (
    <div className="bg-white rounded-md border border-gray-100 overflow-hidden hover:shadow-lg transition transform duration-150 hover:-translate-y-1 group">
      <Link to={`/book/${book.id}`}>
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!book.available && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
              Unavailable
            </div>
          )}
          {book.available && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
              Available
            </div>
          )}
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
          <>
            <button
              onClick={async (e) => {
                e.preventDefault();
                // resolve url (book.pdfUrl or associated elibrary file)
                let url = book.pdfUrl || '';
                if (!url) {
                  try {
                    const f = await api.book.getFile(book.id);
                    if (f && f.data && f.data.url) url = f.data.url;
                  } catch (err) {
                    console.error('No file found for reading', err);
                  }
                }
                if (!url) {
                  // fallback to book detail
                  window.location.href = `/book/${book.id}`;
                  return;
                }
                try {
                  window.open(url, '_blank', 'noopener');
                } catch (err) {
                  window.location.href = url;
                }
              }}
              className="flex-1 bg-white border border-primary-600 text-primary-600 py-1 px-2 rounded-md hover:bg-primary-50 transition-all text-center text-[12px] font-medium flex items-center justify-center space-x-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Read</span>
            </button>

            <button
                onClick={async (e) => {
                e.preventDefault();
                // resolve url
                let url = book.pdfUrl || '';
                if (!url) {
                  try {
                    const f = await api.book.getFile(book.id);
                    if (f && f.data && f.data.url) url = f.data.url;
                  } catch (err) {
                    console.error('No file found for download', err);
                  }
                }
                if (!url) return;
                try {
                  // increment download count on server (include firebaseUid if available)
                  await api.book.incrementDownload(book.id, { firebaseUid: currentUser ? currentUser.uid : undefined });
                  // refresh backend user and notify Profile to refresh
                  if (currentUser) {
                    try {
                      const ru = await api.user.getByFirebaseUid(currentUser.uid);
                      if (ru && ru.data) window.dispatchEvent(new CustomEvent('profile-updated', { detail: ru.data }));
                    } catch (e) { console.error('Failed to refresh backend user after download', e); }
                  }
                  // optimistic UI increment
                  if (typeof book.downloads === 'number') book.downloads += 1;
                } catch (err) {
                  console.error('Failed to increment download count', err);
                }
                // open/download
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
              className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-all"
              title="Download PDF"
            >
              <Download className="h-4 w-4 text-gray-600 hover:text-primary-600 transition-colors" />
            </button>
          </>
        </div>

        <div className="mt-1 flex items-center text-[11px] text-gray-500">
          <Download className="h-3 w-3 mr-1" />
          <span>{book.downloads.toLocaleString()} downloads</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
