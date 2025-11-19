import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Mail, Calendar, BookOpen, Download, Heart, Award, Edit, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { books } from '../data/books';
import api from '../services/api';

// Memoized stat card component
const StatCard = memo(({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
    <div className="flex justify-center mb-3">
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized profile info row
const InfoRow = memo(({ icon: Icon, text }) => (
  <div className="flex items-center justify-center md:justify-start space-x-2">
    <Icon className="h-4 w-4" />
    <span>{text}</span>
  </div>
));

InfoRow.displayName = 'InfoRow';

// Memoized recent activity item
const ActivityItem = memo(({ book }) => (
  <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
    <img
      src={book.coverImage}
      alt={book.title}
      className="w-16 h-24 object-cover rounded"
      loading="lazy"
    />
    <div className="flex-1">
      <Link 
        to={`/book/${book.id}`} 
        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
      >
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
));

ActivityItem.displayName = 'ActivityItem';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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

  // Fetch user stats
  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        if (!currentUser?.uid) return;
        
        const res = await api.user.getByFirebaseUid(currentUser.uid);
        
        if (!mounted || !res?.success || !res.data) return;
        
        const userData = res.data;
        setStats({
          booksRead: userData.booksRead || 0,
          downloads: userData.downloads || 0,
          favorites: Array.isArray(userData.favorites) ? userData.favorites.length : 0,
          reviews: userData.reviews || 0,
        });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };

    loadStats();
    return () => { mounted = false; };
  }, [currentUser]);

  // Memoized profile update handler
  const handleProfileUpdate = useCallback((e) => {
    const userData = e?.detail;
    if (!userData) return;
    
    setStats({
      booksRead: userData.booksRead || 0,
      downloads: userData.downloads || 0,
      favorites: Array.isArray(userData.favorites) ? userData.favorites.length : 0,
      reviews: userData.reviews || 0,
    });
  }, []);

  // Listen for profile updates
  useEffect(() => {
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [handleProfileUpdate]);

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/signin');
  }, [logout, navigate]);

  // Memoized user data
  const user = useMemo(() => {
    if (!currentUser) return null;
    
    return {
      name: currentUser.displayName || 'User',
      email: currentUser.email,
      joinDate: new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      avatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    };
  }, [currentUser]);

  // Memoized recent books
  const recentBooks = useMemo(() => books.slice(0, 3), []);

  // Memoized stat cards configuration
  const statCards = useMemo(() => [
    { icon: BookOpen, value: stats.booksRead, label: 'Books Read', color: 'text-primary-600' },
    { icon: Download, value: stats.downloads, label: 'Downloads', color: 'text-green-600' },
    { icon: Heart, value: stats.favorites, label: 'Favorites', color: 'text-red-600 fill-current' },
    { icon: Award, value: stats.reviews, label: 'Reviews', color: 'text-yellow-600' },
  ], [stats]);

  if (!currentUser || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                loading="eager"
              />
              <button 
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
                aria-label="Edit profile picture"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="space-y-2 text-gray-600">
                <InfoRow icon={Mail} text={user.email} />
                <InfoRow icon={Calendar} text={`Member since ${user.joinDate}`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
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
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              icon={card.icon}
              value={card.value}
              label={card.label}
              color={card.color}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentBooks.map((book) => (
              <ActivityItem key={book.id} book={book} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/browse"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
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