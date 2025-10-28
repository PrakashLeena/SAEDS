import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const JoinUs = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [university, setUniversity] = useState('');
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, age, university, reason, email };
      const res = await api.membership.apply(payload);
      if (res && res.success) {
        // Navigate to thank you or show a message
        navigate('/join-success');
      } else {
        alert(res.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Join Our Community</h1>
        <p className="text-gray-600 mb-6">Fill out the form below to apply for membership.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min="1" className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">University</label>
            <input value={university} onChange={(e) => setUniversity(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Why are you joining us?</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5} required className="mt-1 block w-full border rounded px-3 py-2"></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-2 rounded">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="text-gray-600">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinUs;
