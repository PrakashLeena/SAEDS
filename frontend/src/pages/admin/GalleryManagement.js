import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { galleryFsAPI } from '../../services/api';
import UploadForm from '../../components/ImageGallery/UploadForm';
import GalleryGrid from '../../components/ImageGallery/GalleryGrid';
import ImageModal from '../../components/ImageGallery/ImageModal';

const GalleryManagement = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await galleryFsAPI.list();
      setImages(response.data || []);
    } catch (err) {
      console.error('Failed to load gallery images', err);
      setError(err.message || 'Unable to load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (file) => {
    try {
      setSuccessMessage('');
      await galleryFsAPI.upload(file, currentUser?.uid);
      await fetchImages();
      setSuccessMessage('Image uploaded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (err) {
      console.error('Upload failed', err);
      alert(err.message || 'Upload failed');
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await galleryFsAPI.delete(id, currentUser?.uid);
      await fetchImages();
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Gallery Management</h1>
          <p className="text-slate-600">Upload, preview, and manage gallery images</p>
          {error && <p className="mt-3 text-red-500">{error}</p>}
          {successMessage && <p className="mt-3 text-green-600">{successMessage}</p>}
        </div>

        <UploadForm onUpload={handleUpload} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
          </div>
        ) : (
          <GalleryGrid images={images} onDelete={handleDelete} onSelect={setSelectedImage} />
        )}

        {selectedImage && (
          <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
};

export default GalleryManagement;
