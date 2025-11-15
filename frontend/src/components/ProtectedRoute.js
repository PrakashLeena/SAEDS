import React, { useMemo, memo, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Constants - moved outside component for better performance
const ADMIN_EMAILS = [
  'kibo@gmail.com',
  'saedsmail2025@gmail.com',
];

// Memoized loading component
const LoadingScreen = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
));

LoadingScreen.displayName = 'LoadingScreen';

// Memoized access denied component
const AccessDenied = memo(({ onGoHome }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-4">
        <svg 
          className="mx-auto h-12 w-12 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        You don't have permission to access the admin panel.
      </p>
      <button
        onClick={onGoHome}
        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        Go to Home
      </button>
    </div>
  </div>
));

AccessDenied.displayName = 'AccessDenied';

const ProtectedRoute = memo(({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Memoized admin check
  const isAdmin = useMemo(() => {
    if (!requireAdmin || !currentUser?.email) return false;
    
    const userEmail = currentUser.email.toLowerCase().trim();
    return ADMIN_EMAILS.includes(userEmail);
  }, [currentUser?.email, requireAdmin]);

  // Memoized navigation handler
  const handleGoHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to sign in if not authenticated
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // Check admin access if required
  if (requireAdmin && !isAdmin) {
    return <AccessDenied onGoHome={handleGoHome} />;
  }

  // Render protected content
  return children;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;