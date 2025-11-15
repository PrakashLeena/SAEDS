import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

// Memoized form field component
const FormField = memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false,
  rows,
  min,
  placeholder 
}) => {
  const InputComponent = rows ? 'textarea' : 'input';
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <InputComponent
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        rows={rows}
        min={min}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
      />
    </div>
  );
});

FormField.displayName = 'FormField';

// Memoized alert message component
const AlertMessage = memo(({ type, message }) => {
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  const bgColor = isError ? 'bg-red-50' : 'bg-green-50';
  const borderColor = isError ? 'border-red-200' : 'border-green-200';
  const textColor = isError ? 'text-red-900' : 'text-green-900';
  const iconColor = isError ? 'text-red-600' : 'text-green-600';

  return (
    <div className={`mb-6 ${bgColor} border ${borderColor} rounded-lg p-4 flex items-start space-x-3`}>
      <Icon className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${textColor}`}>{message}</p>
    </div>
  );
});

AlertMessage.displayName = 'AlertMessage';

const JoinUs = () => {
  const navigate = useNavigate();
  
  // Form state using single object for better performance
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    university: '',
    reason: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Memoized change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on input change
    if (error) setError('');
  }, [error]);

  // Memoized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await api.membership.apply(formData);
      
      if (res?.success) {
        setSuccess(true);
        // Navigate after showing success message
        setTimeout(() => {
          navigate('/join-success');
        }, 1500);
      } else {
        setError(res?.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Membership application error:', err);
      setError('Failed to submit application. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Join Our Community</h1>
              <p className="text-gray-600 mt-1">Fill out the form below to apply for membership</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <AlertMessage 
              type="success" 
              message="Application submitted successfully! Redirecting..." 
            />
          )}

          {/* Error Message */}
          {error && (
            <AlertMessage 
              type="error" 
              message={error} 
            />
          )}

          {/* Form */}
          <div className="space-y-6">
            <FormField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />

            <FormField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              type="number"
              min="1"
              placeholder="Enter your age"
            />

            <FormField
              label="University / Institution"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Enter your university or institution"
            />

            <FormField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="your.email@example.com"
            />

            <FormField
              label="Why are you joining us?"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Tell us about your motivation and what you hope to gain from joining our community..."
            />

            {/* Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || success}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Submitting...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Submitted!</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-primary-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• We'll review your application within 2-3 business days</li>
                <li>• You'll receive a confirmation email once approved</li>
                <li>• Gain access to all community resources and events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinUs;