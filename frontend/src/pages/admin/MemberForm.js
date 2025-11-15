import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { memberAPI, uploadAPI } from '../../services/api';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
    universityOrRole: '',
    roleInCommunity: '',
    since: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Fetch member only when editing
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const res = await memberAPI.getById(id);
        if (res?.success && res?.data) {
          const m = res.data;
          setFormData({
            name: m.name || '',
            email: m.email || '',
            phone: m.phone || '',
            photoURL: m.photoURL || '',
            universityOrRole: m.universityOrRole || '',
            roleInCommunity: m.roleInCommunity || '',
            since: m.since || '',
            notes: m.notes || '',
          });
          setPhotoPreview(m.photoURL || '');
        }
      } catch (err) {
        console.error('Failed to load member', err);
      }
    })();
  }, [id, isEdit]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle photo preview
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      // Upload new image if selected
      if (imageFile) {
        const res = await uploadAPI.uploadProfilePhoto(imageFile);
        if (res?.success) {
          payload.photoURL = res.data.url;
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
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/admin/members')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Members</span>
        </button>

        <h1 className="text-3xl font-bold mb-6">
          {isEdit ? 'Edit Member' : 'Add Member'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* University / Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">University / Job role</label>
            <input
              name="universityOrRole"
              value={formData.universityOrRole}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Role in Community */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role in community</label>
            <input
              name="roleInCommunity"
              value={formData.roleInCommunity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since (Year)</label>
            <input
              name="since"
              value={formData.since}
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g. 2021"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Photo</label>

            <div className="mt-2">
              {photoPreview ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={photoPreview}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded"
                  />

                  <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" /> Change
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPhotoPreview('');
                      setFormData((prev) => ({ ...prev, photoURL: '' }));
                    }}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center px-3 py-2 bg-gray-100 rounded cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" /> Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/members')}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
