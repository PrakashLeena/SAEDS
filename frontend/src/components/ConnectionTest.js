import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { healthCheck } from '../services/api';

const ConnectionTest = memo(() => {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize API URL to prevent recalculation
  const apiUrl = useMemo(() => 
    process.env.REACT_APP_API_URL || 'Using default URL',
    []
  );

  // Memoized connection test function
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await healthCheck();
      setStatus('✅ Connected to backend successfully!');
      console.log('Backend response:', data);
    } catch (err) {
      setStatus('❌ Failed to connect to backend');
      setError(err.message || 'Unknown error occurred');
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  // Memoize error section to prevent unnecessary re-renders
  const errorSection = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Error details:</p>
        <pre className="text-sm overflow-x-auto mt-1">{error}</pre>
        <p className="mt-2 text-sm">
          Make sure your backend is running and CORS is properly configured.
        </p>
      </div>
    );
  }, [error]);

  // Memoize retry button
  const retryButton = useMemo(() => {
    if (isLoading) return null;
    
    return (
      <button
        onClick={testConnection}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Retry Connection'}
      </button>
    );
  }, [isLoading, testConnection]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Connection Test</h2>
      
      <div className="mb-2">
        <span className="font-medium">Backend URL:</span>{' '}
        <code className="bg-gray-100 p-1 rounded text-sm">
          {apiUrl}
        </code>
      </div>
      
      <div className="mb-2">
        <span className="font-medium">Status:</span>{' '}
        <span className={isLoading ? 'animate-pulse' : ''}>
          {status}
        </span>
      </div>
      
      {errorSection}
      {retryButton}
    </div>
  );
});

ConnectionTest.displayName = 'ConnectionTest';

export default ConnectionTest;