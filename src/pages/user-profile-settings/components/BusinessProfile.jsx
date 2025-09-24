// src/pages/user-profile-settings/components/BusinessProfile.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BusinessProfile = ({ user, onDataChange }) => {
  const [businessData, setBusinessData] = useState({
    licenseNumber: 'RE-123456789',
    licenseState: 'California',
    licenseExpiry: '2025-06-15',
    brokerageName: 'Premier Realty Group',
    brokerageAddress: '456 Business Plaza, Suite 100',
    brokeragePhone: '+1 (555) 987-6543',
    brokerageWebsite: 'https://www.premierrealty.com',
    yearsExperience: '10',
    languages: ['English', 'Spanish'],
    certifications: ['CRS', 'ABR', 'GRI'],
    specializations: ['Luxury Properties', 'First-time Buyers', 'Investment Properties'],
    serviceAreas: ['Downtown', 'Westside', 'Beachfront'],
    commission: '2.5',
    availability: 'full-time'
  });
  
  const [showMapModal, setShowMapModal] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
    onDataChange?.();
  };

  const handleArrayAdd = (field, value, setter) => {
    if (value?.trim() && !businessData?.[field]?.includes(value?.trim())) {
      setBusinessData(prev => ({
        ...prev,
        [field]: [...prev?.[field], value?.trim()]
      }));
      setter('');
      onDataChange?.();
    }
  };

  const handleArrayRemove = (field, index) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: prev?.[field]?.filter((_, i) => i !== index)
    }));
    onDataChange?.();
  };

  const availabilityOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'weekends', label: 'Weekends Only' },
    { value: 'evenings', label: 'Evenings Only' }
  ];

  const predefinedSpecializations = [
    'Luxury Properties', 'First-time Buyers', 'Investment Properties',
    'Commercial Real Estate', 'Waterfront Properties', 'New Construction',
    'Historic Properties', 'Condominiums', 'Multi-family Properties'
  ];

  return (
    <div className="space-y-6">
      {/* License Information */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            License Information
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your real estate license details
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-text-primary mb-2">
                License Number *
              </label>
              <input
                type="text"
                id="licenseNumber"
                value={businessData?.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label htmlFor="licenseState" className="block text-sm font-medium text-text-primary mb-2">
                License State *
              </label>
              <select
                id="licenseState"
                value={businessData?.licenseState}
                onChange={(e) => handleInputChange('licenseState', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                required
              >
                <option value="California">California</option>
                <option value="New York">New York</option>
                <option value="Texas">Texas</option>
                <option value="Florida">Florida</option>
                {/* Add more states as needed */}
              </select>
            </div>
            
            <div>
              <label htmlFor="licenseExpiry" className="block text-sm font-medium text-text-primary mb-2">
                License Expiry *
              </label>
              <input
                type="date"
                id="licenseExpiry"
                value={businessData?.licenseExpiry}
                onChange={(e) => handleInputChange('licenseExpiry', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                required
              />
            </div>
          </div>
        </div>
      </div>
      {/* Brokerage Details */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Brokerage Details
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Information about your brokerage firm
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="brokerageName" className="block text-sm font-medium text-text-primary mb-2">
                Brokerage Name *
              </label>
              <input
                type="text"
                id="brokerageName"
                value={businessData?.brokerageName}
                onChange={(e) => handleInputChange('brokerageName', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label htmlFor="brokeragePhone" className="block text-sm font-medium text-text-primary mb-2">
                Brokerage Phone
              </label>
              <input
                type="tel"
                id="brokeragePhone"
                value={businessData?.brokeragePhone}
                onChange={(e) => handleInputChange('brokeragePhone', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="brokerageAddress" className="block text-sm font-medium text-text-primary mb-2">
                Brokerage Address
              </label>
              <input
                type="text"
                id="brokerageAddress"
                value={businessData?.brokerageAddress}
                onChange={(e) => handleInputChange('brokerageAddress', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="brokerageWebsite" className="block text-sm font-medium text-text-primary mb-2">
                Brokerage Website
              </label>
              <input
                type="url"
                id="brokerageWebsite"
                value={businessData?.brokerageWebsite}
                onChange={(e) => handleInputChange('brokerageWebsite', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                placeholder="https://"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Service Areas */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary font-heading">
                Service Areas
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Define the areas where you provide services
              </p>
            </div>
            <button
              onClick={() => setShowMapModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Icon name="Map" size={16} />
              <span>Map Selection</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {businessData?.serviceAreas?.map((area, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-2 bg-primary-100 text-primary px-3 py-1 rounded-full text-sm"
              >
                <span>{area}</span>
                <button
                  onClick={() => handleArrayRemove('serviceAreas', index)}
                  className="text-primary hover:text-primary-700"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newServiceArea}
              onChange={(e) => setNewServiceArea(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && handleArrayAdd('serviceAreas', newServiceArea, setNewServiceArea)}
              placeholder="Add service area"
              className="flex-1 px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            />
            <button
              onClick={() => handleArrayAdd('serviceAreas', newServiceArea, setNewServiceArea)}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      {/* Specializations */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Specializations
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Highlight your areas of expertise
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {businessData?.specializations?.map((spec, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-2 bg-accent-100 text-accent-600 px-3 py-1 rounded-full text-sm"
              >
                <span>{spec}</span>
                <button
                  onClick={() => handleArrayRemove('specializations', index)}
                  className="text-accent-600 hover:text-accent-700"
                >
                  <Icon name="X" size={14} />
                </button>
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleArrayAdd('specializations', newSpecialization, setNewSpecialization)}
                placeholder="Add custom specialization"
                className="flex-1 px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
              <button
                onClick={() => handleArrayAdd('specializations', newSpecialization, setNewSpecialization)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
            
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedSpecializations?.filter(spec => !businessData?.specializations?.includes(spec))?.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => handleArrayAdd('specializations', spec, () => {})}
                      className="text-xs bg-secondary-100 text-text-secondary px-2 py-1 rounded hover:bg-secondary-200 transition-colors duration-200"
                    >
                      + {spec}
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Professional Details */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Professional Details
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Additional professional information
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="yearsExperience" className="block text-sm font-medium text-text-primary mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsExperience"
                value={businessData?.yearsExperience}
                onChange={(e) => handleInputChange('yearsExperience', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                min="0"
                max="50"
              />
            </div>
            
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-text-primary mb-2">
                Availability
              </label>
              <select
                id="availability"
                value={businessData?.availability}
                onChange={(e) => handleInputChange('availability', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                {availabilityOptions?.map(option => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="commission" className="block text-sm font-medium text-text-primary mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                id="commission"
                value={businessData?.commission}
                onChange={(e) => handleInputChange('commission', e?.target?.value)}
                className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </div>
          
          {/* Languages */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {businessData?.languages?.map((lang, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-2 bg-success-100 text-success px-3 py-1 rounded-full text-sm"
                >
                  <span>{lang}</span>
                  <button
                    onClick={() => handleArrayRemove('languages', index)}
                    className="text-success hover:text-success-600"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleArrayAdd('languages', newLanguage, setNewLanguage)}
                placeholder="Add language"
                className="flex-1 px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
              <button
                onClick={() => handleArrayAdd('languages', newLanguage, setNewLanguage)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Certifications */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Professional Certifications
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {businessData?.certifications?.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-2 bg-warning-100 text-warning px-3 py-1 rounded-full text-sm"
                >
                  <span>{cert}</span>
                  <button
                    onClick={() => handleArrayRemove('certifications', index)}
                    className="text-warning hover:text-warning-600"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleArrayAdd('certifications', newCertification, setNewCertification)}
                placeholder="Add certification (e.g., CRS, ABR, GRI)"
                className="flex-1 px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
              <button
                onClick={() => handleArrayAdd('certifications', newCertification, setNewCertification)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Select Service Areas</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="h-96 bg-secondary-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Map" size={64} className="text-secondary-300 mx-auto mb-4" />
                  <p className="text-text-secondary">
                    Interactive map for service area selection would be implemented here
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    Integration with mapping services like Google Maps or Mapbox
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
              <button
                onClick={() => setShowMapModal(false)}
                className="border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMapModal(false)}
                className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProfile;