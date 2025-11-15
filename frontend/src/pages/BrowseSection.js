import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../services/api';

// Memoized file card component
const FileCard = memo(({ file, downloadUrl }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-1">
          <FileText className="h-8 w-8 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {file.title}
          </h3>
          {file.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {file.description}
            </p>
          )}
          {file.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              Added {new Date(file.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <a
        href={downloadUrl}
        download
        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm whitespace-nowrap"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download className="h-4 w-4" />
        <span>Download</span>
      </a>
    </div>
  </div>
));

FileCard.displayName = 'FileCard';

// Memoized empty state component
const EmptyState = memo(() => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      <FileText className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No files available</h3>
    <p className="text-gray-600">There are no files in this section yet.</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Memoized error state component
const ErrorState = memo(({ message, onRetry }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
      <AlertCircle className="h-8 w-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load files</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
    >
      Try Again
    </button>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Memoized loading state component
const LoadingState = memo(() => (
  <div className="text-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
    <p className="text-gray-600">Loading files...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

const BrowseSection = memo(() => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized download URLs for all files
  const filesWithUrls = useMemo(() => {
    return files.map(file => ({
      ...file,
      downloadUrl: api.elibrary.downloadUrl(file._id)
    }));
  }, [files]);

  // Load files
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.elibrary.getAll({ folderId });
      setFiles(res.data || []);
    } catch (err) {
      console.error('Failed to load section files', err);
      setError(err?.message || 'Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (!mounted) return;
      await loadFiles();
    };
    
    load();
    return () => { mounted = false; };
  }, [loadFiles]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle retry
  const handleRetry = useCallback(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Section Files
              </h1>
              {!loading && !error && (
                <p className="text-gray-600">
                  {files.length} file{files.length !== 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : files.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filesWithUrls.map(file => (
              <FileCard
                key={file._id}
                file={file}
                downloadUrl={file.downloadUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

BrowseSection.displayName = 'BrowseSection';

export default BrowseSection;