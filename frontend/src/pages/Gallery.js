import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import api from '../services/api';

// Memoized loading state
const LoadingState = memo(() => (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
  </div>
));

LoadingState.displayName = 'LoadingState';

// Memoized empty state
const EmptyState = memo(({ message }) => (
  <p className="text-gray-600">{message}</p>
));

EmptyState.displayName = 'EmptyState';

// Memoized Album Card Component
const AlbumCard = memo(({ album, coverImage, imageCount, onClick }) => (
  <div
    className="bg-white rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-shadow"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
        {coverImage ? (
          <img 
            src={coverImage.url} 
            alt={album.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded" />
        )}
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{album.title}</h3>
        <p className="text-sm text-gray-600 mb-1">{album.description}</p>
        <div className="text-sm text-gray-500">
          {imageCount} photo{imageCount !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="p-4">
        <button className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors">
          Open
        </button>
      </div>
    </div>
  </div>
));

AlbumCard.displayName = 'AlbumCard';

// Memoized Image Card Component
const ImageCard = memo(({ image }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
    <a href={image.url} target="_blank" rel="noreferrer">
      <img 
        src={image.url} 
        alt={image.title || 'Gallery image'} 
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    </a>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-1">{image.title || 'Untitled'}</h3>
      <p className="text-sm text-gray-600 mb-3">{image.description}</p>
      <div className="flex items-center justify-between">
        <a
          href={`${process.env.REACT_APP_API_URL}/upload/download/${image._id}`}
          className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
        >
          Download
        </a>
        <span className="text-xs text-gray-400">
          {new Date(image.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  </div>
));

ImageCard.displayName = 'ImageCard';

const Gallery = () => {
  const [imagesAll, setImagesAll] = useState([]);
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoized album data with cover images and counts
  const albumsWithData = useMemo(() => {
    return albums.map((album) => {
      const coverImage = imagesAll.find((img) => img.albumId === album._id);
      const imageCount = typeof album.count === 'number' 
        ? album.count 
        : imagesAll.filter((img) => img.albumId === album._id).length;
      
      return {
        ...album,
        coverImage,
        imageCount
      };
    });
  }, [albums, imagesAll]);

  // Initial data fetch
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const [albumsRes, imagesRes] = await Promise.all([
          api.albums.getAll(),
          api.gallery.getAll({ limit: 500 }),
        ]);
        
        setAlbums(albumsRes.data || []);
        const imgs = imagesRes.data || [];
        setImagesAll(imgs);
        setImages(imgs);
      } catch (err) {
        console.error('Failed to load gallery images', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGalleryData();
  }, []);

  // Memoized album opener
  const openAlbum = useCallback(async (album) => {
    setSelectedAlbum(album);
    setLoading(true);
    
    try {
      const res = await api.gallery.getAll({ limit: 500, albumId: album._id });
      setImages(res.data || []);
    } catch (err) {
      // Fallback to client-side filter
      setImages(imagesAll.filter((img) => img.albumId === album._id));
    } finally {
      setLoading(false);
    }
  }, [imagesAll]);

  // Memoized back handler
  const backToAlbums = useCallback(() => {
    setSelectedAlbum(null);
    setImages(imagesAll);
  }, [imagesAll]);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Image Gallery</h1>

        {/* Albums Grid View */}
        {!selectedAlbum && (
          <div>
            {albums.length === 0 ? (
              <EmptyState message="No albums yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {albumsWithData.map((album) => (
                  <AlbumCard
                    key={album._id}
                    album={album}
                    coverImage={album.coverImage}
                    imageCount={album.imageCount}
                    onClick={() => openAlbum(album)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Single Album View */}
        {selectedAlbum && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button 
                  onClick={backToAlbums} 
                  className="text-sm text-gray-600 hover:text-gray-900 mr-3 transition-colors"
                >
                  ← Back to albums
                </button>
                <h2 className="text-2xl font-semibold inline">{selectedAlbum.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedAlbum.description}</p>
              </div>
            </div>

            {images.length === 0 ? (
              <EmptyState message="No images in this album yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img) => (
                  <ImageCard key={img._id} image={img} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;