import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Gallery = () => {
  const [imagesAll, setImagesAll] = useState([]);
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [albumsRes, imagesRes] = await Promise.all([
          api.albums.getAll(),
          api.gallery.getAll({ limit: 500 }),
        ]);
        const alb = albumsRes.data || [];
        const imgs = imagesRes.data || [];
        setAlbums(alb);
        setImagesAll(imgs);
        setImages(imgs);
      } catch (err) {
        console.error('Failed to load gallery images', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const openAlbum = async (album) => {
    setSelectedAlbum(album);
    setLoading(true);
    try {
      // prefer server-side filtered results if available
      const res = await api.gallery.getAll({ limit: 500, albumId: album._id });
      const imgs = res.data || [];
      setImages(imgs);
    } catch (err) {
      // fallback to client-side filter
      setImages(imagesAll.filter((i) => i.albumId === album._id));
    } finally {
      setLoading(false);
    }
  };

  const backToAlbums = () => {
    setSelectedAlbum(null);
    setImages(imagesAll);
  };

  if (loading) return <div className="p-8 text-center">Loading gallery...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Image Gallery</h1>

        {/* Album-first view */}
        {!selectedAlbum && (
          <div>
            {albums.length === 0 ? (
              <p className="text-gray-600">No albums yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {albums.map((alb) => {
                  const cover = imagesAll.find((im) => im.albumId === alb._id);
                  const count = typeof alb.count === 'number' ? alb.count : imagesAll.filter((im) => im.albumId === alb._id).length;
                  return (
                    <div
                      key={alb._id}
                      className="bg-white rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg"
                      onClick={() => openAlbum(alb)}
                    >
                      <div className="flex items-center">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                          {cover ? (
                            <img src={cover.url} alt={alb.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded" />
                          )}
                        </div>
                        <div className="p-4 flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{alb.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{alb.description}</p>
                          <div className="text-sm text-gray-500">{count} photo{count !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="p-4">
                          <button className="text-sm bg-primary-600 text-white px-3 py-1 rounded">Open</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Single-album view */}
        {selectedAlbum && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button onClick={backToAlbums} className="text-sm text-gray-600 mr-3">← Back to albums</button>
                <h2 className="text-2xl font-semibold inline">{selectedAlbum.title}</h2>
                <p className="text-sm text-gray-500">{selectedAlbum.description}</p>
              </div>
            </div>

            {images.length === 0 ? (
              <p className="text-gray-600">No images in this album yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img) => (
                  <div key={img._id} className="bg-white rounded-lg overflow-hidden shadow">
                    <a href={img.url} target="_blank" rel="noreferrer">
                      <img src={img.url} alt={img.title || 'Gallery image'} className="w-full h-48 object-cover" />
                    </a>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{img.title || 'Untitled'}</h3>
                      <p className="text-sm text-gray-600 mb-3">{img.description}</p>
                      <div className="flex items-center justify-between">
                        <a
                          href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/upload/download/${img._id}`}
                          className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                        >
                          Download
                        </a>
                        <span className="text-xs text-gray-400">{new Date(img.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
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
