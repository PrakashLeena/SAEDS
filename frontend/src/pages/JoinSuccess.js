import React from 'react';
import { Link } from 'react-router-dom';

const JoinSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Application submitted</h1>
        <p className="text-gray-600 mb-6">Thank you for applying to join our community. We'll review your application and get back to you soon.</p>
        <Link to="/" className="text-primary-600 font-medium">Return to Home</Link>
      </div>
    </div>
  );
};

export default JoinSuccess;
