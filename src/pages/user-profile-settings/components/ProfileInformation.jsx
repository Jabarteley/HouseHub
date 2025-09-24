// src/pages/user-profile-settings/components/ProfileInformation.jsx
import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const ProfileInformation = ({ user, onDataChange }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  const [avatar, setAvatar] = useState(user?.avatar || '/assets/images/profile_default.png');
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onDataChange?.();
  };

  const handleAvatarClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event?.target?.files?.[0];
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e?.target?.result);
        setShowCropModal(true);
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleCropSave = () => {
    if (tempImage) {
      setAvatar(tempImage);
      onDataChange?.();
    }
    setShowCropModal(false);
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImage(null);
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary font-heading">
          Profile Information
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Update your personal information and profile photo
        </p>
      </div>
      <div className="p-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary-100 cursor-pointer" onClick={handleAvatarClick}>
              <img
                src={avatar}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = '/assets/images/profile_default.png';
                }}
              />
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Icon name="Camera" size={20} className="text-white" />
            </button>
          </div>
          
          <div className="mt-4 sm:mt-0 flex-1">
            <h3 className="text-lg font-medium text-text-primary">{formData?.name}</h3>
            <p className="text-text-secondary text-sm mb-3">
              Click on the photo to upload a new profile picture
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleAvatarClick}
                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Upload Photo
              </button>
              <button
                onClick={() => {
                  setAvatar('/assets/images/profile_default.png');
                  onDataChange?.();
                }}
                className="border border-border text-text-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData?.location}
              onChange={(e) => handleInputChange('location', e?.target?.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="City, State"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData?.website}
              onChange={(e) => handleInputChange('website', e?.target?.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="https://www.yourwebsite.com"
            />
          </div>

          {/* Bio */}
          {user?.role === 'agent' && (
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-text-primary mb-2">
                Professional Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData?.bio}
                onChange={(e) => handleInputChange('bio', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary resize-none"
                placeholder="Tell potential clients about your experience and expertise..."
                maxLength={500}
              />
              <p className="text-xs text-text-secondary mt-1">
                {formData?.bio?.length}/500 characters
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Crop Profile Photo</h3>
            
            <div className="mb-6">
              <div className="w-full h-64 bg-secondary-100 rounded-lg overflow-hidden flex items-center justify-center">
                {tempImage && (
                  <img
                    src={tempImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <p className="text-sm text-text-secondary mt-2">
                Crop functionality would be implemented here with a proper image cropping library
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCropSave}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Save
              </button>
              <button
                onClick={handleCropCancel}
                className="flex-1 border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInformation;