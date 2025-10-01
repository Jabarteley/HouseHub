// src/pages/agent-dashboard/components/QuickListingForm.jsx
import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';

const QuickListingForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    description: '',
    mlsIntegration: true
  });
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const propertyTypes = [
    'Single Family Home',
    'Condominium',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Commercial'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e?.target?.files);
    const newPhotos = files?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => {
      const photo = prev?.find(p => p?.id === photoId);
      if (photo?.preview) {
        URL.revokeObjectURL(photo?.preview);
      }
      return prev?.filter(p => p?.id !== photoId);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.address?.trim()) newErrors.address = 'Address is required';
    if (!formData?.city?.trim()) newErrors.city = 'City is required';
    if (!formData?.state?.trim()) newErrors.state = 'State is required';
    if (!formData?.zipCode?.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData?.price?.trim()) newErrors.price = 'Price is required';
    if (!formData?.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData?.bedrooms?.trim()) newErrors.bedrooms = 'Bedrooms is required';
    if (!formData?.bathrooms?.trim()) newErrors.bathrooms = 'Bathrooms is required';
    
    const price = parseFloat(formData?.price);
    if (isNaN(price) || price <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        photos: photos?.map(p => p?.file)
      };
      
      await onSubmit?.(submissionData);
    } catch (error) {
      console.error('Error submitting listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up photo previews
    photos?.forEach(photo => {
      if (photo?.preview) {
        URL.revokeObjectURL(photo?.preview);
      }
    });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-lg shadow-elevation-5 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary font-heading">
              Create New Listing
            </h2>
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>
        
        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Address */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-text-primary mb-4">Property Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData?.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.address ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors?.address && (
                      <p className="text-error text-xs mt-1">{errors?.address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData?.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.city ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                      placeholder="San Francisco"
                    />
                    {errors?.city && (
                      <p className="text-error text-xs mt-1">{errors?.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData?.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.state ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                      placeholder="CA"
                    />
                    {errors?.state && (
                      <p className="text-error text-xs mt-1">{errors?.state}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-text-primary mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData?.price}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.price ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                      placeholder="450000"
                    />
                    {errors?.price && (
                      <p className="text-error text-xs mt-1">{errors?.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={formData?.propertyType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.propertyType ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                    >
                      <option value="">Select type</option>
                      {propertyTypes?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors?.propertyType && (
                      <p className="text-error text-xs mt-1">{errors?.propertyType}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData?.bedrooms}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.bedrooms ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                      placeholder="3"
                      min="0"
                    />
                    {errors?.bedrooms && (
                      <p className="text-error text-xs mt-1">{errors?.bedrooms}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData?.bathrooms}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                        errors?.bathrooms ? 'border-error' : 'border-border focus:border-border-focus'
                      }`}
                      placeholder="2"
                      min="0"
                      step="0.5"
                    />
                    {errors?.bathrooms && (
                      <p className="text-error text-xs mt-1">{errors?.bathrooms}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Photo Upload */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-text-primary mb-4">Photos</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex flex-col items-center space-y-2"
                  >
                    <Icon name="Upload" size={32} className="text-secondary-300" />
                    <span className="text-text-secondary">Click to upload photos</span>
                    <span className="text-xs text-text-secondary">PNG, JPG up to 10MB each</span>
                  </label>
                </div>
                
                {photos?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {photos?.map(photo => (
                      <div key={photo?.id} className="relative">
                        <img
                          src={photo?.preview}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo?.id)}
                          className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 hover:bg-error-500 transition-colors duration-200"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData?.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                  placeholder="Describe the property features, amenities, and highlights..."
                />
              </div>
              
              {/* MLS Integration */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="mlsIntegration"
                    checked={formData?.mlsIntegration}
                    onChange={handleInputChange}
                    className="rounded border-border text-primary focus:ring-primary-500"
                    id="mls-integration"
                  />
                  <label htmlFor="mls-integration" className="text-sm text-text-primary">
                    Sync with MLS
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out micro-interaction"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickListingForm;