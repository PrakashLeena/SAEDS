// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://saeds-tau.vercel.app/api';

// Cache for GET requests (5 minute TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token') || '';

// Helper to check cache
const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

// Helper to set cache
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper to clear cache by pattern
const clearCachePattern = (pattern) => {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) cache.delete(key);
  }
};

// Error messages map
const ERROR_MESSAGES = {
  401: 'Authentication required',
  403: 'Access denied',
  404: 'Resource not found',
  429: 'Too many requests. Please try again later',
  500: 'Server error. Please try again later',
  503: 'Service unavailable. Please try again later',
};

// Helper function for API calls with caching and error handling
const apiCall = async (endpoint, options = {}) => {
  const { skipCache = false, ...fetchOptions } = options;
  const token = getAuthToken();
  
  // Cache key for GET requests
  const cacheKey = `${endpoint}${JSON.stringify(options.body || {})}`;
  
  // Check cache for GET requests
  if (!skipCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(fetchOptions.headers || {})
  };
  
  const config = {
    ...fetchOptions,
    headers,
    credentials: 'include'
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle error statuses
    if (!response.ok) {
      const errorMessage = ERROR_MESSAGES[response.status];
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('Authentication required');
        // Optional: Trigger logout or token refresh
        // window.dispatchEvent(new Event('unauthorized'));
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: errorMessage || response.statusText };
      }
      
      throw new Error(errorData.message || errorMessage || 'Something went wrong');
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    const result = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();
    
    // Cache successful GET requests
    if (!skipCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      setCache(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    
    throw error;
  }
};

// API factory to reduce boilerplate
const createAPI = (baseEndpoint, options = {}) => ({
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`${baseEndpoint}${query ? '?' + query : ''}`, options);
  },
  
  getById: (id) => apiCall(`${baseEndpoint}/${id}`, options),
  
  create: (data) => {
    clearCachePattern(baseEndpoint);
    return apiCall(baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  update: (id, data) => {
    clearCachePattern(baseEndpoint);
    return apiCall(`${baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  delete: (id) => {
    clearCachePattern(baseEndpoint);
    return apiCall(`${baseEndpoint}/${id}`, {
      method: 'DELETE',
      ...options
    });
  },
});

// User API
export const userAPI = {
  ...createAPI('/users'),
  
  getByFirebaseUid: (uid) => apiCall(`/users/firebase/${uid}`),
  
  sync: (userData) => {
    clearCachePattern('/users');
    return apiCall('/users/sync', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  addFavorite: (userId, bookId) => {
    clearCachePattern('/users');
    return apiCall(`/users/${userId}/favorites/${bookId}`, { method: 'POST' });
  },
  
  removeFavorite: (userId, bookId) => {
    clearCachePattern('/users');
    return apiCall(`/users/${userId}/favorites/${bookId}`, { method: 'DELETE' });
  },
  
  // Admin methods
  getStats: () => apiCall('/users/admin/stats'),
  toggleRole: (userId) => apiCall(`/users/admin/toggle-role/${userId}`, { method: 'PUT' }),
  toggleStatus: (userId) => apiCall(`/users/admin/toggle-status/${userId}`, { method: 'PUT' }),
  deleteUser: (userId) => apiCall(`/users/admin/${userId}`, { method: 'DELETE' }),
  create: (userData) => apiCall('/users/admin/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Book API
export const bookAPI = {
  ...createAPI('/books'),
  
  getStats: (id) => apiCall(`/books/${id}/stats`),
  getFile: (id) => apiCall(`/books/${id}/file`),
  getCategories: () => apiCall('/books/meta/categories'),
  
  incrementDownload: (id, { firebaseUid } = {}) => {
    clearCachePattern(`/books/${id}`);
    return apiCall(`/books/${id}/download`, {
      method: 'POST',
      body: JSON.stringify(firebaseUid ? { firebaseUid } : {}),
    });
  },
  
  markRead: (id, { firebaseUid } = {}) => apiCall(`/books/${id}/read`, {
    method: 'POST',
    body: JSON.stringify(firebaseUid ? { firebaseUid } : {}),
  }),
};

// Activity API
export const activityAPI = {
  ...createAPI('/activities'),
  
  getUpcoming: () => apiCall('/activities?upcoming=true'),
  
  register: (activityId, userId) => apiCall(`/activities/${activityId}/register/${userId}`, {
    method: 'POST',
  }),
  
  unregister: (activityId, userId) => apiCall(`/activities/${activityId}/register/${userId}`, {
    method: 'DELETE',
  }),
};

// Upload helper function
const uploadFile = async (endpoint, file, additionalData = {}) => {
  const formData = new FormData();
  
  // Determine the file field name based on endpoint
  const fieldNames = {
    'profile-photo': 'profilePhoto',
    'book-cover': 'coverImage',
    'book-pdf': 'pdfFile',
    'elibrary': 'file',
    'gallery': 'image',
    'activity-image': 'image',
  };
  
  const fieldName = fieldNames[endpoint.split('/').pop()] || 'file';
  formData.append(fieldName, file);
  
  // Append additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  
  const response = await fetch(`${API_URL}/upload/${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};

// Upload API
export const uploadAPI = {
  uploadProfilePhoto: (file) => uploadFile('profile-photo', file),
  uploadBookCover: (file) => uploadFile('book-cover', file),
  uploadBookPDF: async (file) => {
    const signatureResponse = await apiCall('/upload/book-pdf-signature', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (!signatureResponse.success) {
      throw new Error(signatureResponse.message || 'Failed to get upload signature');
    }

    const { cloudName, apiKey, timestamp, signature, folder } = signatureResponse.data;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      const message =
        (result && result.error && result.error.message) ||
        (result && result.message) ||
        'Failed to upload PDF';
      throw new Error(message);
    }

    return {
      success: true,
      message: 'Book PDF uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    };
  },
  
  uploadElibraryFile: (file, data = {}) => {
    clearCachePattern('/upload/elibrary');
    return uploadFile('elibrary', file, data);
  },
  
  uploadGalleryImage: (file, data = {}) => {
    clearCachePattern('/upload/gallery');
    return uploadFile('gallery', file, data);
  },
  
  uploadActivityImage: (file) => uploadFile('activity-image', file),
  
  deleteFile: (publicId) => {
    const encodedId = publicId.replace(/\//g, '_');
    return apiCall(`/upload/delete/${encodedId}`, { method: 'DELETE' });
  },
};

// Gallery API
export const galleryAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/upload/gallery${query ? '?' + query : ''}`);
  },
  
  delete: (id, firebaseUid) => {
    clearCachePattern('/upload/gallery');
    const headers = firebaseUid ? { 'x-firebase-uid': firebaseUid } : {};
    return apiCall(`/upload/gallery/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ firebaseUid }),
    });
  },
};

// Album API
export const albumAPI = {
  getAll: () => apiCall('/upload/albums'),
  
  create: (title, description, firebaseUid) => {
    clearCachePattern('/upload/albums');
    return apiCall('/upload/albums', {
      method: 'POST',
      body: JSON.stringify({ title, description, firebaseUid }),
    });
  },
  
  delete: (id, firebaseUid) => {
    clearCachePattern('/upload/albums');
    const headers = firebaseUid ? { 'x-firebase-uid': firebaseUid } : {};
    return apiCall(`/upload/albums/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ firebaseUid }),
    });
  },
};

// E-Library API
export const elibraryAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/upload/elibrary${query ? '?' + query : ''}`);
  },
  
  delete: (id, firebaseUid) => {
    clearCachePattern('/upload/elibrary');
    const headers = firebaseUid ? { 'x-firebase-uid': firebaseUid } : {};
    return apiCall(`/upload/elibrary/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ firebaseUid }),
    });
  },
  
  downloadUrl: (id) => `${API_URL}/upload/elibrary/download/${id}`,
};

// E-Library folders API
export const elibraryFolderAPI = {
  getTree: () => apiCall('/elibrary/folders'),
  create: (payload) => apiCall('/elibrary/folders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => apiCall(`/elibrary/folders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  delete: (id, payload = {}) => apiCall(`/elibrary/folders/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  }),
};

// Contact API
export const contactAPI = {
  sendMessage: (contactData) => apiCall('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData),
  }),
};

// Membership API
export const membershipAPI = {
  apply: (payload) => apiCall('/membership/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

// Stats API
export const statsAPI = {
  getOverview: () => apiCall('/stats'),
};

// Member API
export const memberAPI = createAPI('/members');

// Achievement API
export const achievementAPI = {
  ...createAPI('/achievements'),
  getAllAdmin: () => apiCall('/achievements/all'),
};

// Health check
export const healthCheck = () => apiCall('/health');

// Utility function to clear all cache
export const clearAllCache = () => cache.clear();

// Export all APIs
const defaultExport = {
  user: userAPI,
  book: bookAPI,
  activity: activityAPI,
  upload: uploadAPI,
  gallery: galleryAPI,
  albums: albumAPI,
  elibrary: elibraryAPI,
  elibraryFolders: elibraryFolderAPI,
  membership: membershipAPI,
  contact: contactAPI,
  stats: statsAPI,
  member: memberAPI,
  achievement: achievementAPI,
  healthCheck,
  clearAllCache,
};

export default defaultExport;