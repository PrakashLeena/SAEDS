import React, { useState, useCallback, memo } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { contactAPI } from '../services/api';
import SEO from '../components/SEO';

// Memoized contact info cards to prevent unnecessary re-renders
const ContactInfoCard = memo(({ icon: Icon, title, children, href }) => (
  <div className="flex items-start space-x-4">
    <div className="bg-primary-100 p-3 rounded-lg">
      <Icon className="h-6 w-6 text-primary-600" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {href ? (
        <a href={href} className="text-gray-600 hover:text-primary-600 transition-colors">
          {children}
        </a>
      ) : (
        <p className="text-gray-600">{children}</p>
      )}
    </div>
  </div>
));

ContactInfoCard.displayName = 'ContactInfoCard';

// Memoized alert messages
const AlertMessage = memo(({ type, title, message }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-green-900' : 'text-red-900';
  const descColor = isSuccess ? 'text-green-700' : 'text-red-700';
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`mb-6 ${bgColor} border ${borderColor} rounded-lg p-4 flex items-start space-x-3`}>
      <Icon className={`h-6 w-6 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <h3 className={`font-semibold ${textColor} mb-1`}>{title}</h3>
        <p className={`text-sm ${descColor}`}>{message}</p>
      </div>
    </div>
  );
});

AlertMessage.displayName = 'AlertMessage';

// Memoized input field component
const InputField = memo(({ label, name, type = 'text', value, onChange, required = false, placeholder, rows }) => {
  const InputComponent = rows ? 'textarea' : 'input';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <InputComponent
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
        placeholder={placeholder}
      />
    </div>
  );
});

InputField.displayName = 'InputField';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Memoized change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Memoized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await contactAPI.sendMessage(formData);

      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <SEO
        title="Contact Us"
        description="Get in touch with SAEDS. We are here to help with any inquiries about our community, events, or resources."
      />
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-primary-100">
              We'd love to hear from you. Get in touch with us!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                <div className="space-y-6">
                  <ContactInfoCard
                    icon={Mail}
                    title="Email"
                    href="mailto:saedsmail2025@gmail.com"
                  >
                    saedsmail2025@gmail.com
                  </ContactInfoCard>

                  <ContactInfoCard
                    icon={Phone}
                    title="Phone"
                    href="tel:+94756175604"
                  >
                    +94756175604
                  </ContactInfoCard>

                  <ContactInfoCard
                    icon={MapPin}
                    title="Address"
                  >
                    Ward.No-6<br />
                    Mannar,Vankalai<br />
                    SriLanka
                  </ContactInfoCard>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                {success && (
                  <AlertMessage
                    type="success"
                    title="Message Sent Successfully!"
                    message="Thank you for contacting us. We'll get back to you as soon as possible."
                  />
                )}

                {error && (
                  <AlertMessage
                    type="error"
                    title="Error"
                    message={error}
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />

                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@gmail.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Phone Number (Optional)"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 (234) 567-890"
                    />

                    <InputField
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                    />
                  </div>

                  <InputField
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
            <p className="text-gray-600">Visit our office or community center</p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg h-96">
            <iframe
              title="SAEDS Location"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3960.0!2d79.9325!3d8.8928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOMKwNTMnMzQuMSJOIDc5wrA1NSc1Ny4wIkU!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;