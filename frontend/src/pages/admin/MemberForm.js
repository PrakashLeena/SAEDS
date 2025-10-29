import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { memberAPI, uploadAPI } from '../../services/api';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', photoURL: '', universityOrRole: '', since: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await memberAPI.getAll();
        if (res && res.success) {
          const m = res.data.find(x => x._id === id);
          if (m) setFormData({ name: m.name, email: m.email || '', phone: m.phone || '', photoURL: m.photoURL || '', universityOrRole: m.universityOrRole || '', since: m.since || '', notes: m.notes || '' });
        }
      } catch (err) {
        console.error('Failed to load member', err);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } catch (err) {
      setPhotoPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      // If an image file was selected, upload it first
      if (imageFile) {
        try {
          const res = await uploadAPI.uploadProfilePhoto(imageFile);
          if (res && res.success && res.data && res.data.url) {
            payload.photoURL = res.data.url;
          }
        } catch (err) {
          console.error('Photo upload failed', err);
          alert('Photo upload failed');
          setLoading(false);
          return;
        }
      }

      if (isEdit) {
        await memberAPI.update(id, payload);
      } else {
        await memberAPI.create(payload);
      }
      navigate('/admin/members');
    } catch (err) {
      console.error('Failed to save member', err);
      alert('Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => navigate('/admin/members')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"><ArrowLeft className="h-5 w-5" /><span>Back to Members</span></button>
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Member' : 'Add Member'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-3 py-2 border rounded" placeholder="member@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-3 py-2 border rounded" placeholder="+1234567890" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">University / Job role</label>
            <input name="universityOrRole" value={formData.universityOrRole} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="e.g., University of X / Software Engineer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since (Year)</label>
            <input 
              name="since" 
              value={formData.since} 
              onChange={handleChange} 
              type="number" 
              min="1900" 
              max={new Date().getFullYear()} 
              className="w-full px-3 py-2 border rounded" 
              placeholder={`e.g., ${new Date().getFullYear()}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Photo (optional)</label>
            <div className="mt-2">
              {photoPreview || formData.photoURL ? (
                <div className="flex items-start space-x-4">
                  <img src={photoPreview || formData.photoURL} alt="preview" className="w-24 h-24 object-cover rounded" />
                  <div>
                    <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" /> Change
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <button type="button" onClick={() => { setImageFile(null); setPhotoPreview(''); setFormData(prev => ({ ...prev, photoURL: '' })); }} className="ml-3 text-sm text-red-600">Remove</button>
                  </div>
                </div>
              ) : (
                <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" /> Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => navigate('/admin/members')} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
