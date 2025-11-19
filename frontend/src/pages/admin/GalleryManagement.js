import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const GalleryManagement = () => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const seen = new Set();
    const deduped = [];
    for (const file of selectedFiles) {
      const key = `${file.name}_${file.size}_${file.lastModified}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(file);
      }
    }
    if (deduped.length > 25) {
      alert('You can upload a maximum of 25 images at a time. Extra files will be ignored.');
    }
    setFiles(deduped.slice(0, 25));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return alert('Please select at least one image');
    if (uploading) return;
    try {
      setUploading(true);
      for (const file of files) {
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
        if (!res.success) {
          alert(res.message || 'Upload failed');
        }
      }
      setTitle('');
      setDescription('');
      setFiles([]);
      fetchImages();
      fetchAlbums();
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleSelectImage = (id) => {
    setSelectedImageIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleToggleSelectAll = () => {
    if (!images || images.length === 0) return;
    if (selectedImageIds.length === images.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(images.map((img) => img._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!currentUser) return alert('Admin login required');
    if (!selectedImageIds.length) return;
    if (!window.confirm(`Delete ${selectedImageIds.length} selected image(s)?`)) return;
    try {
      setBulkDeleting(true);
      let hadError = false;
      for (const id of selectedImageIds) {
        try {
          const res = await api.gallery.delete(id, currentUser.uid);
          if (!res.success) {
            hadError = true;
          }
        } catch (err) {
          hadError = true;
          console.error(err);
        }
      }
      setSelectedImageIds([]);
      fetchImages();
      if (hadError) {
        alert('Some images could not be deleted.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected images');
    } finally {
      setBulkDeleting(false);
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

  if (loading) return <div className="p-6 text-center text-gray-600 animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4 transition-colors duration-300 text-gray-900">Gallery Management</h1>

        <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow-md mb-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={uploading} className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors duration-200" />
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
              <button type="button" onClick={handleCreateAlbum} className="text-sm text-primary-600 hover:text-primary-800 transition-colors duration-200">Create album</button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors duration-200 transform hover:-translate-y-0.5"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">
            {selectedImageIds.length > 0 ? `${selectedImageIds.length} selected` : 'No images selected'}
          </div>
          <div className="space-x-2">
            <button
              type="button"
              className="text-xs text-primary-600 hover:text-primary-800 transition-colors duration-200"
              onClick={handleToggleSelectAll}
              disabled={!images || images.length === 0}
            >
              {images && images.length > 0 && selectedImageIds.length === images.length ? 'Clear selection' : 'Select all'}
            </button>
            <button
              type="button"
              className="text-xs text-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-red-700 transition-colors duration-200"
              onClick={handleDeleteSelected}
              disabled={bulkDeleting || selectedImageIds.length === 0 || !currentUser}
            >
              {bulkDeleting ? 'Deleting selected...' : 'Delete selected'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-up">
          {images.map(img => (
            <div key={img._id} className="bg-white rounded shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <img src={img.url} alt={img.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{img.title || 'Untitled'}</h3>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedImageIds.includes(img._id)}
                    onChange={() => toggleSelectImage(img._id)}
                  />
                </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-up">
            {albums.map(a => (
              <div key={a._id} className="bg-white rounded shadow-md p-3 flex items-center justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-gray-500">{typeof a.count === 'number' ? `${a.count} photo${a.count !== 1 ? 's' : ''}` : ''}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => { setSelectedAlbumId(a._id); }} className="text-xs text-primary-600 hover:text-primary-800 transition-colors duration-200">Select</button>
                  <button onClick={() => handleDeleteAlbum(a._id)} className="text-xs text-red-600 hover:text-red-700 transition-colors duration-200">Delete</button>
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
