import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { elibraryFolders } from '../../data/elibrary';

const flattenSections = (folders) => {
  const sections = [];
  folders.forEach((f) => {
    f.children.forEach((c) => {
      if (c.sections && c.sections.length > 0) {
        c.sections.forEach((s) => sections.push({ folderId: s.id, folderTitle: `${f.title} / ${c.title} / ${s.title}` }));
      } else {
        sections.push({ folderId: c.id, folderTitle: `${f.title} / ${c.title}` });
      }
    });
  });
  return sections;
};

const ElibraryManagement = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [sections, setSections] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setSections(flattenSections(elibraryFolders));
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.elibrary.getAll();
      setFiles(res.data || []);
    } catch (err) {
      console.error('Failed to load elibrary files', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Admin login required');
    if (!file) return alert('Please select a file');
    if (!selectedFolder) return alert('Please select a target folder/section');

    try {
      const res = await api.upload.uploadElibraryFile(file, {
        firebaseUid: currentUser.uid,
        title,
        description,
        folderId: selectedFolder,
        folderTitle: sections.find(s => s.folderId === selectedFolder)?.folderTitle || '',
      });
      if (res.success) {
        setFile(null);
        setTitle('');
        setDescription('');
        fetchFiles();
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
    if (!window.confirm('Delete this file?')) return;
    try {
      const res = await api.elibrary.delete(id, currentUser.uid);
      if (res.success) fetchFiles();
      else alert(res.message || 'Delete failed');
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">E-Library Management</h1>

        <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">File (PDF)</label>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
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
            <label className="block text-sm font-medium text-gray-700">Target Folder / Section</label>
            <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
              <option value="">-- Select folder/section --</option>
              {sections.map(s => (
                <option key={s.folderId} value={s.folderId}>{s.folderTitle}</option>
              ))}
            </select>
          </div>

          <div>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Upload</button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-4">
          {files.map(f => (
            <div key={f._id} className="bg-white rounded shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{f.title}</div>
                <div className="text-xs text-gray-500">{f.folderTitle || f.folderId}</div>
              </div>
              <div className="space-x-3 text-sm">
                <a href={api.elibrary.downloadUrl(f._id)} className="text-primary-600">Download</a>
                <button onClick={() => handleDelete(f._id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElibraryManagement;
