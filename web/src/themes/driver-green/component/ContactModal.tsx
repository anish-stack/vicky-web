import React, { useState } from 'react';
import { X, User, Phone, Mail, MessageSquare, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form data:', formData);
    setIsSubmitting(false);
    onClose();
    setFormData({ name: '', phone: '', email: '', message: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-dark-900 rounded-2xl px-8 pt-6 pb-8 text-left overflow-hidden shadow-soft-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-dark-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                <Mail className="w-6 h-6 text-primary-600 dark:text-primary-500" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-white">
                Get In Touch
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-dark-500 dark:text-dark-400" />
            </button>
          </div>

          <p className="text-dark-600 dark:text-dark-300 mb-6">
            Have questions or need assistance? Send us a message and we'll get back to you soon.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-dark-400 dark:placeholder:text-dark-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-dark-400 dark:placeholder:text-dark-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-dark-400 dark:placeholder:text-dark-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-primary-500 w-5 h-5" />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none placeholder:text-dark-400 dark:placeholder:text-dark-500"
                  placeholder="How can we help you?"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg flex items-center justify-center group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create a wrapper component to manage the modal state
const ContactModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for custom events to open the modal
  React.useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('openContactModal', handleOpenModal);
    return () => window.removeEventListener('openContactModal', handleOpenModal);
  }, []);

  return <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

export default ContactModalWrapper;