import React, { useEffect, useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, BookOpen, FileText, Plus, Trash2, Edit2, X, Check, Upload, Download, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const normalizeFolders = (nodes = []) =>
  nodes.map(node => ({
    id: node.id,
    name: node.title,
    description: node.description || '',
    type: 'folder',
    expanded: false,
    children: normalizeFolders(node.children || []),
  }));

const combineChildren = (folderChildren = [], fileChildren = []) => {
  const foldersOnly = folderChildren.filter(item => item.type === 'folder');
  return [...foldersOnly, ...fileChildren];
};

const ElibraryManagement = () => {
  const { currentUser } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showAddForm, setShowAddForm] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null,
  });

  const firebaseUid = currentUser?.uid || null;

  const loadFolders = useCallback(async () => {
    setLoadingTree(true);
    try {
      const res = await api.elibraryFolders.getTree();
      const tree = normalizeFolders(res?.data || []);
      setFolders(tree);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to load e-library folders', error);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const loadFolderFiles = useCallback(async (folderId) => {
    try {
      const res = await api.elibrary.getAll({ folderId });
      return (res?.data || []).map(file => ({
        id: file._id,
        name: file.title,
        description: file.description || '',
        url: file.url,
        publicId: file.publicId,
        folderId,
        type: 'book',
      }));
    } catch (error) {
      console.error('Failed to load files for folder', folderId, error);
      return [];
    }
  }, []);

  const toggleFolder = async (folderId) => {
    const toggle = async (node) => {
      if (node.id !== folderId || node.type !== 'folder') return node;

      const newExpanded = !node.expanded;
      if (!newExpanded) {
        return { ...node, expanded: false };
      }

      const files = await loadFolderFiles(folderId);
      return {
        ...node,
        expanded: true,
        children: combineChildren(node.children || [], files),
      };
    };

    const runToggle = async (items) => {
      const result = [];
      for (const item of items) {
        if (item.id === folderId && item.type === 'folder') {
          result.push(await toggle(item));
        } else if (item.children?.length) {
          const updatedChildren = await runToggle(item.children);
          result.push({ ...item, children: updatedChildren });
        } else {
          result.push(item);
        }
      }
      return result;
    };

    const updated = await runToggle(folders);
    setFolders(updated);
  };

  const findItem = useCallback((id, items = folders) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }, [folders]);

  const addFolder = async () => {
    if (!newFolderName.trim()) return;
    if (!firebaseUid) return alert('Admin login required');
    try {
      const payload = {
        firebaseUid,
        title: newFolderName.trim(),
        parentId: showAddForm === 'root' ? null : showAddForm,
      };
      await api.elibraryFolders.create(payload);
      await loadFolders();
      setShowAddForm(null);
      setNewFolderName('');
    } catch (error) {
      console.error('Failed to add folder', error);
      alert('Failed to add folder');
    }
  };

  const deleteFolder = async (folderId) => {
    if (!firebaseUid) return alert('Admin login required');
    if (!window.confirm('Delete this folder and all its contents?')) return;
    try {
      await api.elibraryFolders.delete(folderId, { firebaseUid });
      await loadFolders();
    } catch (error) {
      console.error('Failed to delete folder', error);
      alert('Failed to delete folder');
    }
  };

  const renameFolder = async () => {
    if (!editingName.trim() || !editingId) return;
    if (!firebaseUid) return alert('Admin login required');
    try {
      await api.elibraryFolders.update(editingId, {
        firebaseUid,
        title: editingName.trim(),
      });
      setEditingId(null);
      setEditingName('');
      await loadFolders();
    } catch (error) {
      console.error('Failed to rename folder', error);
      alert('Failed to rename folder');
    }
  };

  const deleteFile = async (fileId) => {
    if (!firebaseUid) return alert('Admin login required');
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      const res = await api.elibrary.delete(fileId, firebaseUid);
      if (res.success) {
        await loadFolders();
      } else {
        alert(res.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file', error);
      alert('Failed to delete file');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!firebaseUid) return alert('Admin login required');
    if (!uploadForm.file || !uploadForm.title.trim()) {
      alert('Please provide a title and select a file');
      return;
    }

    const folderItem = findItem(uploadFolderId);
    const payload = {
      firebaseUid,
      title: uploadForm.title.trim(),
      description: uploadForm.description.trim(),
      folderId: uploadFolderId,
      folderTitle: folderItem?.name || '',
    };

    try {
      const response = await api.upload.uploadElibraryFile(uploadForm.file, payload);
      if (response.success) {
        setShowUploadModal(false);
        setUploadForm({ title: '', description: '', file: null });
        await loadFolders();
      } else {
        alert(response.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file', error);
      alert('Failed to upload file');
    }
  };

  const downloadFile = (id) => {
    window.open(api.elibrary.downloadUrl(id), '_blank');
  };

  const viewFile = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderTree = (items, level = 0, parentId = null) => {
    return items.map(item => (
      <div key={item.id} className="text-sm">
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
            selectedItem === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {item.type === 'folder' && (
            <button
              onClick={() => toggleFolder(item.id)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {item.expanded ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          )}

          <div
            onClick={() => setSelectedItem(item.id)}
            className="flex items-center gap-2 flex-1"
          >
            {item.type === 'folder' ? (
              item.expanded ? (
                <FolderOpen size={18} className="text-blue-500" />
              ) : (
                <Folder size={18} className="text-blue-500" />
              )
            ) : (
              <BookOpen size={18} className="text-green-600" />
            )}

            {editingId === item.id ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && renameFolder()}
                  className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={renameFolder}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditingName('');
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <span className="text-gray-700">{item.name}</span>
                {item.description && (
                  <p className="text-xs text-gray-500">{item.description}</p>
                )}
              </div>
            )}
          </div>

          {selectedItem === item.id && item.type === 'folder' && editingId !== item.id && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setUploadFolderId(item.id);
                  setShowUploadModal(true);
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Upload file"
              >
                <Upload size={14} />
              </button>
              <button
                onClick={() => setShowAddForm(item.id)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Add subfolder"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setEditingName(item.name);
                }}
                className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                title="Rename"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => deleteFolder(item.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {selectedItem === item.id && item.type === 'book' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => viewFile(item.url)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="View"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => downloadFile(item.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Download"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => deleteFile(item.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {showAddForm === item.id && (
          <div
            className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 m-2"
            style={{ marginLeft: `${(level + 1) * 20 + 8}px` }}
          >
            <Folder size={16} className="text-blue-500" />
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFolder()}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={addFolder}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setShowAddForm(null);
                setNewFolderName('');
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {item.type === 'folder' && item.expanded && item.children?.length > 0 && (
          <div>{renderTree(item.children, level + 1, item.id)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-white" />
              E-Library Management System
            </h1>
            <p className="text-blue-100 mt-1">Organize books and research papers</p>
          </div>

          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedItem ? (
                <span>Selected: <strong>{findItem(selectedItem)?.name || '—'}</strong></span>
              ) : (
                <span>No item selected</span>
              )}
            </div>
            <button
              onClick={() => setShowAddForm('root')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Root Folder
            </button>
          </div>

          {showAddForm === 'root' && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <Folder size={20} className="text-blue-500" />
                <input
                  type="text"
                  placeholder="Enter folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFolder()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={addFolder}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(null);
                    setNewFolderName('');
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="p-4 max-h-[600px] overflow-y-auto">
            {loadingTree ? (
              <div className="text-center py-12 text-gray-500">
                Loading folders...
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Folder size={48} className="mx-auto mb-4 opacity-50" />
                <p>No folders yet. Create your first folder to get started!</p>
              </div>
            ) : (
              renderTree(folders)
            )}
          </div>

          <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Total folders: {folders.length}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} className="text-green-600" />
                  Books
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={14} className="text-orange-500" />
                  Papers
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click folders to expand/collapse and load their books.</li>
            <li>• Use the upload button to add PDFs to the selected folder.</li>
            <li>• Create nested folders to organize grades, streams, and subjects.</li>
            <li>• Use the actions on each file to view, download, or delete.</li>
          </ul>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Upload size={24} className="text-blue-600" />
                Upload File
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Uploading to: <strong>{findItem(uploadFolderId)?.name || 'Unknown'}</strong>
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter file title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File (PDF) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({ title: '', description: '', file: null });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElibraryManagement;
