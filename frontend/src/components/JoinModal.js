import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

// Constants
const RESET_DELAY = 2000;

// Memoized form field component
const FormField = memo(({ 
  label, 
  value, 
  onChange, 
  required = false, 
  type = 'text',
  rows,
  min,
  placeholder
}) => {
  const isTextarea = type === 'textarea';
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={rows || 5}
          required={required}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          type={type}
          min={min}
          required={required}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Memoized success message component
const SuccessMessage = memo(() => (
  <div className="text-center py-12">
    <div className="mb-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
    <p className="text-gray-600">Thank you for joining our community. We'll be in touch soon.</p>
  </div>
));

SuccessMessage.displayName = 'SuccessMessage';

const JoinModal = memo(({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    university: '',
    reason: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref to track timeout for cleanup
  const resetTimeoutRef = useRef(null);

  // Memoized form fields configuration
  const formFields = useMemo(() => [
    { name: 'name', label: 'Name', required: true, type: 'text' },
    { name: 'age', label: 'Age', type: 'number', min: '1' },
    { name: 'university', label: 'University', type: 'text' },
    { name: 'email', label: 'Email (optional)', type: 'email' },
    { name: 'reason', label: 'Why are you joining us?', required: true, type: 'textarea', rows: 5 }
  ], []);

  // Optimized form field change handler
  const handleFieldChange = useCallback((field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  }, [error]);

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      age: '',
      university: '',
      reason: '',
      email: ''
    });
    setSuccess(false);
    setError(null);
  }, []);

  // Optimized form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.membership.apply(formData);
      
      if (res?.success) {
        setSuccess(true);
        // Reset form and close modal after delay
        resetTimeoutRef.current = setTimeout(() => {
          resetForm();
          onClose();
        }, RESET_DELAY);
      } else {
        setError(res?.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Membership application error:', err);
      setError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, resetForm, onClose]);

  // Memoized close handler
  const handleClose = useCallback(() => {
    if (loading) return; // Prevent closing during submission
    resetForm();
    onClose();
  }, [loading, resetForm, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, handleClose]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Early return if modal is closed
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          {success ? (
            <SuccessMessage />
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Our Community</h2>
              <p className="text-gray-600 mb-6">Fill out the form below to apply for membership.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {formFields.map((field) => (
                  <FormField
                    key={field.name}
                    label={field.label}
                    value={formData[field.name]}
                    onChange={handleFieldChange(field.name)}
                    required={field.required}
                    type={field.type}
                    rows={field.rows}
                    min={field.min}
                  />
                ))}

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

JoinModal.displayName = 'JoinModal';

export default JoinModal;