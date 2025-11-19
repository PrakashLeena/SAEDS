import React, { useCallback, useEffect, useState } from 'react';
import { galleryFsAPI } from '../services/api';
import GalleryGrid from '../components/ImageGallery/GalleryGrid';
import ImageModal from '../components/ImageGallery/ImageModal';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await galleryFsAPI.list();
      setImages(response.data || []);
    } catch (err) {
      console.error('Failed to load gallery images', err);
      setError(err.message || 'Unable to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto" />
          <p className="mt-4 text-slate-600 text-lg">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Image Gallery</h1>
          <p className="text-slate-600 text-lg">Explore the latest moments from our community</p>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>

        <GalleryGrid images={images} onSelect={setSelectedImage} />

        {selectedImage && (
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
        )}
      </div>
    </div>
  );
};

export default Gallery;