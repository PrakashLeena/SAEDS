import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, memo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config';
import { userAPI } from '../services/api';

const AuthContext = createContext(undefined);

// Custom hook with better error message
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Memoized loading screen component
const AuthLoadingScreen = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
      <p className="mt-4 text-gray-600">Initializing...</p>
    </div>
  </div>
));

AuthLoadingScreen.displayName = 'AuthLoadingScreen';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  // Memoized user sync function
  const syncUserToMongoDB = useCallback(async (user) => {
    if (!user) return;

    try {
      await userAPI.sync({
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || '',
      });
      console.log('✅ User synced to MongoDB');
      setSyncError(null);
    } catch (error) {
      console.error('❌ Error syncing user to MongoDB:', error);
      setSyncError(error?.message || 'Sync failed');
      // Don't throw - allow app to continue even if sync fails
    }
  }, []);

  // Memoized logout function
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setSyncError(null);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error; // Re-throw so caller can handle
    }
  }, []);

  // Memoized refresh user function (useful for profile updates)
  const refreshUser = useCallback(async () => {
    if (currentUser) {
      await syncUserToMongoDB(currentUser);
    }
  }, [currentUser, syncUserToMongoDB]);

  // Firebase auth state listener
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      setCurrentUser(user);
      
      // Sync user to MongoDB when they sign in
      if (user) {
        await syncUserToMongoDB(user);
      }
      
      setLoading(false);
    });

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [syncUserToMongoDB]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentUser,
      loading,
      syncError,
      logout,
      refreshUser,
    }),
    [currentUser, loading, syncError, logout, refreshUser]
  );

  // Show loading screen while initializing auth
  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};