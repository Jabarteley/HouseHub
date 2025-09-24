// src/pages/property-details/components/ContactForm.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ContactForm = ({ property, agent, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `I'm interested in ${property?.title} at ${property?.address}. Please contact me to schedule a viewing or provide more information.`,
    contactMethod: 'email', // 'email', 'phone', 'text'preferredTime: 'anytime' // 'morning', 'afternoon', 'evening', 'anytime'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/?.test(formData?.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData?.message?.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e?.target === e?.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {isSubmitted ? (
          // Success State
          (<div className="p-8 text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Message Sent Successfully!
            </h2>
            <p className="text-text-secondary mb-6">
              Thank you for your interest. {agent?.name} will contact you within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-all duration-200"
            >
              Close
            </button>
          </div>)
        ) : (
          // Form State
          (<>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-4">
                <Image
                  src={agent?.avatar}
                  alt={agent?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Contact {agent?.name}
                  </h2>
                  <p className="text-text-secondary">
                    About {property?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-100 rounded-md transition-all duration-200"
                aria-label="Close form"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData?.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                      errors?.name ? 'border-error' : 'border-border focus:border-primary'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors?.name && (
                    <p className="mt-1 text-sm text-error">{errors?.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                      errors?.email ? 'border-error' : 'border-border focus:border-primary'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors?.email && (
                    <p className="mt-1 text-sm text-error">{errors?.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData?.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                    errors?.phone ? 'border-error' : 'border-border focus:border-primary'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors?.phone && (
                  <p className="mt-1 text-sm text-error">{errors?.phone}</p>
                )}
              </div>

              {/* Contact Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactMethod" className="block text-sm font-medium text-text-primary mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="contactMethod"
                    name="contactMethod"
                    value={formData?.contactMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="text">Text Message</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-text-primary mb-2">
                    Best Time to Contact
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData?.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <option value="anytime">Anytime</option>
                    <option value="morning">Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData?.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 resize-vertical ${
                    errors?.message ? 'border-error' : 'border-border focus:border-primary'
                  }`}
                  placeholder="Tell us about your interest in this property..."
                />
                {errors?.message && (
                  <p className="mt-1 text-sm text-error">{errors?.message}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    message: `I would like to schedule a showing for ${property?.title} at ${property?.address}.` 
                  }))}
                  className="px-3 py-1 text-sm bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-all duration-200"
                >
                  Schedule Showing
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    message: `I need more information about ${property?.title}. Can you provide details about the neighborhood, schools, and amenities?` 
                  }))}
                  className="px-3 py-1 text-sm bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-all duration-200"
                >
                  Request More Info
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    message: `What is the best price you can offer for ${property?.title}?` 
                  }))}
                  className="px-3 py-1 text-sm bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-all duration-200"
                >
                  Discuss Price
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-border text-text-secondary rounded-md hover:bg-secondary-100 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-secondary text-text-secondary cursor-not-allowed' :'bg-primary text-white hover:bg-primary-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-text-secondary bg-secondary-100 p-3 rounded-md">
                <Icon name="Info" size={12} className="inline mr-1" />
                Your information will only be shared with the listing agent and will not be used for marketing purposes.
              </div>
            </form>
          </>)
        )}
      </div>
    </div>
  );
};

export default ContactForm;