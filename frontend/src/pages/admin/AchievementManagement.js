import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import { achievementAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

const AchievementManagement = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await achievementAPI.getAllAdmin();
      if (res && res.success) {
        const sorted = (res.data || []).sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        });
        setAchievements(sorted);
      }
    } catch (err) {
      console.error('Error loading achievements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await achievementAPI.delete(id);
      fetchAchievements();
    } catch (err) {
      console.error('Failed to delete achievement', err);
      alert('Failed to delete achievement');
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

    const newAchievements = [...achievements];
    const draggedAchievement = newAchievements[draggedIndex];
    
    newAchievements.splice(draggedIndex, 1);
    newAchievements.splice(dropIndex, 0, draggedAchievement);
    
    const updatedAchievements = newAchievements.map((achievement, idx) => ({
      ...achievement,
      order: idx
    }));
    
    setAchievements(updatedAchievements);
    setDraggedIndex(null);
    
    try {
      await Promise.all(
        updatedAchievements.map(achievement => 
          achievementAPI.update(achievement._id, { order: achievement.order })
        )
      );
    } catch (err) {
      console.error('Failed to update order', err);
      alert('Failed to save new order');
      fetchAchievements();
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
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
            <p className="text-gray-600 mt-1">Manage community achievements and milestones</p>
            <p className="text-sm text-primary-600 mt-2 flex items-center">
              <GripVertical className="h-4 w-4 mr-1" />
              Drag and drop rows to reorder achievements
            </p>
          </div>
          <div>
            <Link to="/admin/achievements/add" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="h-4 w-4 mr-2" /> Add Achievement
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon/Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {achievements.map((achievement, index) => (
                    <tr 
                      key={achievement._id} 
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-500">{achievement.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-primary-600">{achievement.value}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {achievement.imageURL ? (
                          <img 
                            src={achievement.imageURL} 
                            alt={achievement.title}
                            className="h-10 w-10 object-cover rounded-full border border-gray-300"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">{achievement.icon}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {achievement.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          achievement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {achievement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => navigate(`/admin/achievements/edit/${achievement._id}`)} 
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(achievement._id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {achievements.length === 0 && (
              <div className="text-center py-12">No achievements found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementManagement;
