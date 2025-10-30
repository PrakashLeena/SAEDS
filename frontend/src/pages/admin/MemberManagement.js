import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import { memberAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await memberAPI.getAll();
      if (res && res.success) {
        // Sort by order field if it exists, otherwise by creation date
        const sorted = (res.data || []).sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        });
        setMembers(sorted);
      }
    } catch (err) {
      console.error('Error loading members', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await memberAPI.delete(id);
      fetchMembers();
    } catch (err) {
      console.error('Failed to delete member', err);
      alert('Failed to delete member');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newMembers = [...members];
    const draggedMember = newMembers[draggedIndex];
    
    // Remove from old position
    newMembers.splice(draggedIndex, 1);
    // Insert at new position
    newMembers.splice(dropIndex, 0, draggedMember);
    
    // Update order field for all members
    const updatedMembers = newMembers.map((member, idx) => ({
      ...member,
      order: idx
    }));
    
    setMembers(updatedMembers);
    setDraggedIndex(null);
    
    // Save new order to backend
    try {
      await Promise.all(
        updatedMembers.map(member => 
          memberAPI.update(member._id, { order: member.order })
        )
      );
    } catch (err) {
      console.error('Failed to update order', err);
      alert('Failed to save new order');
      fetchMembers(); // Reload on error
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600 mt-1">Community members managed by admins</p>
            <p className="text-sm text-primary-600 mt-2 flex items-center">
              <GripVertical className="h-4 w-4 mr-1" />
              Drag and drop rows to reorder members
            </p>
          </div>
          <div>
            <Link to="/admin/members/add" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University / Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Since</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((m, index) => (
                    <tr 
                      key={m._id} 
                      className={`hover:bg-gray-50 cursor-move transition-all ${
                        draggedIndex === index ? 'opacity-50 bg-primary-50' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <td className="px-2 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                          <GripVertical className="h-5 w-5" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={m.photoURL || 'https://via.placeholder.com/48'} alt={m.name} className="h-10 w-10 rounded-full object-cover" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{m.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.universityOrRole || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {m.since ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {m.since}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => navigate(`/admin/members/edit/${m._id}`)} className="p-2 text-primary-600 hover:bg-primary-50 rounded"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(m._id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 && (
              <div className="text-center py-12">No members found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
