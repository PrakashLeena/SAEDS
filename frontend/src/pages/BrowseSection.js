import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const BrowseSection = () => {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.elibrary.getAll({ folderId });
        setFiles(res.data || []);
      } catch (err) {
        console.error('Failed to load section files', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [folderId]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Section files</h1>
        {files.length === 0 ? (
          <div className="text-gray-600">No files in this section.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {files.map(f => (
              <div key={f._id} className="bg-white rounded shadow p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.description}</div>
                </div>
                <div className="space-x-3 text-sm">
                  <a href={api.elibrary.downloadUrl(f._id)} className="text-primary-600">Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseSection;
