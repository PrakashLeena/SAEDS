import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Calendar, MapPin, Users as UsersIcon, Filter, X } from 'lucide-react';
import api from '../services/api';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Constants
const DEFAULT_CATEGORIES = ['All'];

// Memoized utility function
const formatDate = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return String(d);
  }
};

// Get attendee count
const getAttendeeCount = (activity) => {
  return activity.registered ?? activity.registeredUsers?.length ?? 0;
};

// Memoized header component
const ActivityHeader = memo(({ headerRef, headerVisible }) => (
  <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div 
        ref={headerRef} 
        className={`text-center transition-all duration-700 ${
          headerVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Activities</h1>
        <p className="text-xl text-primary-100">
          Explore our vibrant community events and activities
        </p>
      </div>
    </div>
  </section>
));

ActivityHeader.displayName = 'ActivityHeader';

// Memoized filter button component
const FilterButton = memo(({ category, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
      isSelected
        ? 'bg-primary-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {category}
  </button>
));

FilterButton.displayName = 'FilterButton';

// Memoized activity card component
const ActivityCard = memo(({ activity, index, onClick }) => {
  const attendeeCount = useMemo(() => getAttendeeCount(activity), [activity]);
  const formattedDate = useMemo(() => formatDate(activity.date), [activity.date]);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        {/* Image */}
        <div className="relative h-80 overflow-hidden bg-gray-200">
          {activity.image ? (
            <img
              src={activity.image}
              alt={activity.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-3xl font-semibold">No image</div>
                <div className="text-sm">(No photo provided)</div>
              </div>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-sm line-clamp-3">{activity.description}</p>
            </div>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
              {activity.category}
            </span>
          </div>
        </div>

        {/* Caption */}
        <div className="bg-white p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
            {activity.title}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary-600" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              <span>{activity.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-primary-600" />
              <span>{attendeeCount} attendees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ActivityCard.displayName = 'ActivityCard';

// Memoized modal component
const ActivityModal = memo(({ activity, onClose }) => {
  const attendeeCount = useMemo(() => getAttendeeCount(activity), [activity]);
  const formattedDate = useMemo(() => formatDate(activity.date), [activity.date]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        aria-label="Close modal"
      >
        <X className="h-8 w-8" />
      </button>

      <div
        className="max-w-6xl w-full bg-white rounded-lg overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Large Image */}
          <div className="relative h-96 lg:h-auto">
            {activity.image ? (
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-2xl font-semibold">No image available</div>
                  <div className="text-sm">This activity has no photo.</div>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                {activity.category}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 overflow-y-auto max-h-[600px]">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {activity.title}
            </h2>
            
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {activity.description}
            </p>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{activity.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UsersIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Attendees</p>
                  <p className="text-lg font-semibold text-gray-900">{attendeeCount} people</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-8 w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ActivityModal.displayName = 'ActivityModal';

const Activity = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headerRef, headerVisible] = useScrollAnimation();

  // Load activities from backend
  useEffect(() => {
    let mounted = true;
    
    const loadActivities = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await api.activity.getAll();
        
        if (!mounted) return;
        
        if (res?.success) {
          const items = res.data || [];
          setActivities(items);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(items.map(i => i.category).filter(Boolean))
          );
          setCategories(['All', ...uniqueCategories]);
        } else {
          setError('Failed to load activities');
        }
      } catch (err) {
        console.error('Failed loading activities', err);
        if (mounted) {
          setError(err?.message || 'Failed to load activities');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadActivities();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Memoized filtered activities
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'All') return activities;
    return activities.filter(activity => activity.category === selectedCategory);
  }, [selectedCategory, activities]);

  // Memoized category change handler
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Memoized activity selection handler
  const handleActivityClick = useCallback((activity) => {
    setSelectedActivity(activity);
  }, []);

  // Memoized modal close handler
  const handleModalClose = useCallback(() => {
    setSelectedActivity(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <ActivityHeader headerRef={headerRef} headerVisible={headerVisible} />

      {/* Filter Section */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <FilterButton
                key={category}
                category={category}
                isSelected={selectedCategory === category}
                onClick={() => handleCategoryChange(category)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading activities...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredActivities.length}</span> activit
                  {filteredActivities.length !== 1 ? 'ies' : 'y'}
                </p>
              </div>

              {filteredActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.map((activity, index) => (
                    <ActivityCard
                      key={activity._id || activity.id}
                      activity={activity}
                      index={index}
                      onClick={() => handleActivityClick(activity)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No activities found in this category</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default Activity;