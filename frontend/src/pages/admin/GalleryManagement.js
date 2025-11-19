import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const GalleryManagement = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await api.albums.getAll();
      setAlbums(res.data || []);
    } catch (err) {
      console.error('Failed to load albums', err);
    }
  };
  
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    const title = prompt('Album title');
    if (!title) return;
    try {
      const res = await api.albums.create(title, '', currentUser?.uid);
      if (res.success) {
        fetchAlbums();
      } else {
        alert(res.message || 'Failed to create album');
      }
    } catch (err) {
      console.error('Create album error', err);
      alert('Failed to create album');
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!currentUser) return alert('Admin login required');
    if (!window.confirm('Delete this album? This will detach images from the album but keep the images.')) return;
    try {
      const res = await api.albums.delete(albumId, currentUser.uid);
      if (res.success) {
        fetchAlbums();
        fetchImages();
      } else {
        alert(res.message || 'Failed to delete album');
      }
    } catch (err) {
      console.error('Delete album error', err);
      alert('Failed to delete album');
    }
  };

  const fetchImages = async () => {
    try {
      const res = await api.gallery.getAll({ limit: 200 });
      setImages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an image');
    try {
      const res = await api.upload.uploadGalleryImage(file, {
        firebaseUid: currentUser?.uid,
        title,
        description,
        albumId: selectedAlbumId,
      });
      // If an album is selected, call dedicated endpoint to attach image to album via albumId
      if (res.success && selectedAlbumId) {
        // Update the image with album association by re-uploading metadata link isn't necessary because backend accepts albumId during upload.
      }
      if (res.success) {
        setTitle('');
        setDescription('');
        setFile(null);
        fetchImages();
        fetchAlbums();
      } else {
        alert(res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!currentUser) return alert('Admin login required');
    if (!window.confirm('Delete this image?')) return;
    try {
      const res = await api.gallery.delete(id, currentUser.uid);
      if (res.success) fetchImages();
      else alert(res.message || 'Delete failed');
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Gallery Management</h1>

        <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Album</label>
            <div className="flex items-center space-x-2">
              <select value={selectedAlbumId || ''} onChange={(e) => setSelectedAlbumId(e.target.value || null)} className="mt-1 block border rounded px-3 py-2">
                <option value="">-- Select album (or create) --</option>
                {albums.map(a => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
              <button type="button" onClick={handleCreateAlbum} className="text-sm text-primary-600">Create album</button>
            </div>
          </div>
          <div>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Upload</button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map(img => (
            <div key={img._id} className="bg-white rounded shadow overflow-hidden">
              <img src={img.url} alt={img.title} className="w-full h-40 object-cover" />
              <div className="p-3">
                <h3 className="font-semibold text-sm">{img.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-500 mb-2">{img.description}</p>
                <div className="flex items-center justify-between">
                  <a href={img.url} target="_blank" rel="noreferrer" className="text-xs text-primary-600">Open</a>
                  <a href={`${process.env.REACT_APP_API_URL}/upload/download/${img._id}`} className="text-xs text-primary-600">Download</a>
                  <button onClick={() => handleDelete(img._id)} className="text-xs text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Albums</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map(a => (
              <div key={a._id} className="bg-white rounded shadow p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-gray-500">{typeof a.count === 'number' ? `${a.count} photo${a.count !== 1 ? 's' : ''}` : ''}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => { setSelectedAlbumId(a._id); }} className="text-xs text-primary-600">Select</button>
                  <button onClick={() => handleDeleteAlbum(a._id)} className="text-xs text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryManagement;
