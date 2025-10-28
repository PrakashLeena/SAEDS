const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API
export const userAPI = {
  // Get all users
  getAll: () => apiCall('/users'),

  // Get user by Firebase UID
  getByFirebaseUid: (uid) => apiCall(`/users/firebase/${uid}`),

  // Sync Firebase user to MongoDB
  sync: (userData) => apiCall('/users/sync', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Update user profile
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  // Add book to favorites
  addFavorite: (userId, bookId) => apiCall(`/users/${userId}/favorites/${bookId}`, {
    method: 'POST',
  }),

  // Remove book from favorites
  removeFavorite: (userId, bookId) => apiCall(`/users/${userId}/favorites/${bookId}`, {
    method: 'DELETE',
  }),

  // Admin: Get statistics
  getStats: () => apiCall('/users/admin/stats'),

  // Admin: Toggle user role
  toggleRole: (userId) => apiCall(`/users/admin/toggle-role/${userId}`, {
    method: 'PUT',
  }),

  // Admin: Toggle user status
  toggleStatus: (userId) => apiCall(`/users/admin/toggle-status/${userId}`, {
    method: 'PUT',
  }),

  // Admin: Delete user
  deleteUser: (userId) => apiCall(`/users/admin/${userId}`, {
    method: 'DELETE',
  }),

  // Admin: Create user manually
  create: (userData) => apiCall('/users/admin/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Book API
export const bookAPI = {
  // Get all books with optional filters
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/books${query ? '?' + query : ''}`);
  },

  // Get single book by ID
  getById: (id) => apiCall(`/books/${id}`),

  // Get book stats (downloads, favoritesCount)
  getStats: (id) => apiCall(`/books/${id}/stats`),

  // Get associated file (PDF) for a book if pdfUrl missing
  getFile: (id) => apiCall(`/books/${id}/file`),

  // Create new book
  create: (bookData) => apiCall('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  }),

  // Update book
  update: (id, bookData) => apiCall(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  }),

  // Delete book
  delete: (id) => apiCall(`/books/${id}`, {
    method: 'DELETE',
  }),

  // Increment download count (optionally include firebaseUid in body)
  incrementDownload: (id, { firebaseUid } = {}) => apiCall(`/books/${id}/download`, {
    method: 'POST',
    body: JSON.stringify(firebaseUid ? { firebaseUid } : {}),
  }),

  // Mark book as read (optionally include firebaseUid)
  markRead: (id, { firebaseUid } = {}) => apiCall(`/books/${id}/read`, {
    method: 'POST',
    body: JSON.stringify(firebaseUid ? { firebaseUid } : {}),
  }),

  // Get all categories
  getCategories: () => apiCall('/books/meta/categories'),
};

// Activity API
export const activityAPI = {
  // Get all activities with optional filters
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/activities${query ? '?' + query : ''}`);
  },

  // Get upcoming activities
  getUpcoming: () => apiCall('/activities?upcoming=true'),

  // Get single activity by ID
  getById: (id) => apiCall(`/activities/${id}`),

  // Create new activity
  create: (activityData) => apiCall('/activities', {
    method: 'POST',
    body: JSON.stringify(activityData),
  }),

  // Update activity
  update: (id, activityData) => apiCall(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(activityData),
  }),

  // Delete activity
  delete: (id) => apiCall(`/activities/${id}`, {
    method: 'DELETE',
  }),

  // Register user for activity
  register: (activityId, userId) => apiCall(`/activities/${activityId}/register/${userId}`, {
    method: 'POST',
  }),

  // Unregister user from activity
  unregister: (activityId, userId) => apiCall(`/activities/${activityId}/register/${userId}`, {
    method: 'DELETE',
  }),
};

// Upload API
export const uploadAPI = {
  // Upload profile photo
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return fetch(`${API_URL}/upload/profile-photo`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  // Upload book cover
  uploadBookCover: (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    return fetch(`${API_URL}/upload/book-cover`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  // Upload book PDF
  uploadBookPDF: (file) => {
    const formData = new FormData();
    formData.append('pdfFile', file);
    return fetch(`${API_URL}/upload/book-pdf`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  // Delete file
  deleteFile: (publicId) => {
    const encodedId = publicId.replace(/\//g, '_');
    return apiCall(`/upload/delete/${encodedId}`, {
      method: 'DELETE',
    });
  },
  // Upload elibrary file (admin)
  uploadElibraryFile: (file, { firebaseUid, title, description, folderId, folderTitle } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (firebaseUid) formData.append('firebaseUid', firebaseUid);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (folderId) formData.append('folderId', folderId);
    if (folderTitle) formData.append('folderTitle', folderTitle);

    return fetch(`${API_URL}/upload/elibrary`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  // Upload gallery image (admin)
  uploadGalleryImage: (file, { firebaseUid, title, description, albumId, albumTitle } = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    if (firebaseUid) formData.append('firebaseUid', firebaseUid);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (albumId) formData.append('albumId', albumId);
    if (albumTitle) formData.append('albumTitle', albumTitle);

    return fetch(`${API_URL}/upload/gallery`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  // Upload activity image locally
  uploadActivityImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_URL}/upload/activity-image`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
};

// Gallery API (public + admin actions)
export const galleryAPI = {
  // List images
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/upload/gallery${query ? '?' + query : ''}`);
  },

  // Delete image (admin) - include firebaseUid in body
  delete: (id, firebaseUid) => {
    const headers = firebaseUid ? { 'x-firebase-uid': firebaseUid } : {};
    return apiCall(`/upload/gallery/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ firebaseUid }),
    });
  },
};

// Albums (public + admin)
export const albumAPI = {
  getAll: () => apiCall('/upload/albums'),
  create: (title, description, firebaseUid) => apiCall('/upload/albums', {
    method: 'POST',
    body: JSON.stringify({ title, description, firebaseUid }),
  }),
  // Delete album (admin) - include firebaseUid in headers/body
  delete: (id, firebaseUid) => {
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
  // List files, optional folderId filter
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/upload/elibrary${query ? '?' + query : ''}`);
  },

  // Delete file (admin)
  delete: (id, firebaseUid) => {
    const headers = firebaseUid ? { 'x-firebase-uid': firebaseUid } : {};
    return apiCall(`/upload/elibrary/${id}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ firebaseUid }),
    });
  },

  // Download URL (proxy)
  downloadUrl: (id) => `${API_URL}/upload/elibrary/download/${id}`,
};

// Contact API
export const contactAPI = {
  // Send contact form message
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
  // Get basic public stats (active members, events hosted)
  getOverview: () => apiCall('/stats'),
};

// Health check
export const healthCheck = () => apiCall('/health');

// Export all APIs
// Member API (separate from user accounts)
export const memberAPI = {
  getAll: () => apiCall('/members'),
  create: (payload) => apiCall('/members', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiCall(`/members/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => apiCall(`/members/${id}`, { method: 'DELETE' }),
};

// Export all APIs (single default export including memberAPI)
const defaultExport = {
  user: userAPI,
  book: bookAPI,
  activity: activityAPI,
  upload: uploadAPI,
  gallery: galleryAPI,
  albums: albumAPI,
  elibrary: elibraryAPI,
  membership: membershipAPI,
  contact: contactAPI,
  stats: statsAPI,
  healthCheck,
  member: memberAPI,
};

export default defaultExport;
