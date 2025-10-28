import React, { useEffect, useState } from 'react';
import { Mail, Calendar, BookOpen, Download, Heart, Award, Edit, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { books } from '../data/books';
import api from '../services/api';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // State for stats (booksRead, downloads, favorites, reviews)
  const [stats, setStats] = useState({
    booksRead: 0,
    downloads: 0,
    favorites: 0,
    reviews: 0,
  });

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  // Fetch user stats from backend (by firebase UID) and populate stats
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!currentUser || !currentUser.uid) return;
        const res = await api.user.getByFirebaseUid(currentUser.uid);
        if (!mounted) return;
        if (res && res.success && res.data) {
          const userData = res.data;
          setStats({
            booksRead: userData.booksRead || 0,
            downloads: userData.downloads || 0,
            favorites: Array.isArray(userData.favorites) ? userData.favorites.length : 0,
            reviews: userData.reviews || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentUser]);

  // Listen for profile-updated events dispatched elsewhere (e.g., after download/favorite)
  useEffect(() => {
    const handler = (e) => {
      const userData = e && e.detail ? e.detail : null;
      if (!userData) return;
      setStats({
        booksRead: userData.booksRead || 0,
        downloads: userData.downloads || 0,
        favorites: Array.isArray(userData.favorites) ? userData.favorites.length : 0,
        reviews: userData.reviews || 0,
      });
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  if (!currentUser) {
    return null;
  }


  // User data from Firebase
  const user = {
    name: currentUser.displayName || 'User',
    email: currentUser.email,
    joinDate: new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    avatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  };

  

  const recentBooks = books.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
              />
              <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {user.joinDate}</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-3">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.booksRead}</p>
            <p className="text-sm text-gray-600">Books Read</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-3">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.downloads}</p>
            <p className="text-sm text-gray-600">Downloads</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-3">
              <Heart className="h-8 w-8 text-red-600 fill-current" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.favorites}</p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-3">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.reviews}</p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentBooks.map((book) => (
              <div key={book.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <Link to={`/book/${book.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                    {book.title}
                  </Link>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">Downloaded 2 days ago</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                    {book.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/browse"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Activity →
            </Link>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Profile;
