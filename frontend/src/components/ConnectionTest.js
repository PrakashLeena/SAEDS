import React, { useState, useEffect } from 'react';
import { healthCheck } from '../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const data = await healthCheck();
        setStatus('✅ Connected to backend successfully!');
        console.log('Backend response:', data);
      } catch (err) {
        setStatus('❌ Failed to connect to backend');
        setError(err.message);
        console.error('Connection error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Connection Test</h2>
      <div className="mb-2">
        <span className="font-medium">Backend URL:</span>{' '}
        <code className="bg-gray-100 p-1 rounded">
          {process.env.REACT_APP_API_URL || 'Using default URL'}
        </code>
      </div>
      <div className="mb-2">
        <span className="font-medium">Status:</span> {status}
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error details:</p>
          <pre className="text-sm overflow-x-auto mt-1">{error}</pre>
          <p className="mt-2 text-sm">
            Make sure your backend is running and CORS is properly configured.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
