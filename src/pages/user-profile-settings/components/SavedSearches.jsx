// src/pages/user-profile-settings/components/SavedSearches.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SavedSearches = ({ user, onDataChange }) => {
  const [savedSearches, setSavedSearches] = useState([
    {
      id: '1',
      name: 'Downtown Condos',
      criteria: {
        location: 'Downtown',
        propertyType: 'Condo',
        priceRange: '$300K - $500K',
        bedrooms: '2+',
        bathrooms: '2+'
      },
      frequency: 'daily',
      isActive: true,
      resultCount: 23,
      lastUpdated: '2024-01-15',
      created: '2023-12-01'
    },
    {
      id: '2',
      name: 'Suburban Family Homes',
      criteria: {
        location: 'Westside',
        propertyType: 'House',
        priceRange: '$400K - $700K',
        bedrooms: '3+',
        bathrooms: '2+'
      },
      frequency: 'weekly',
      isActive: true,
      resultCount: 8,
      lastUpdated: '2024-01-14',
      created: '2023-11-15'
    },
    {
      id: '3',
      name: 'Investment Properties',
      criteria: {
        location: 'All Areas',
        propertyType: 'Multi-family',
        priceRange: '$200K - $400K',
        bedrooms: 'Any',
        bathrooms: 'Any'
      },
      frequency: 'immediate',
      isActive: false,
      resultCount: 12,
      lastUpdated: '2024-01-10',
      created: '2023-10-20'
    }
  ]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);

  const handleToggleActive = (searchId) => {
    setSavedSearches(prev => 
      prev?.map(search => 
        search?.id === searchId 
          ? { ...search, isActive: !search?.isActive }
          : search
      )
    );
    onDataChange?.();
  };

  const handleEdit = (search) => {
    setEditingSearch(search);
    setShowEditModal(true);
  };

  const handleDelete = (searchId) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      setSavedSearches(prev => prev?.filter(search => search?.id !== searchId));
      onDataChange?.();
    }
  };

  const handleSaveEdit = (updatedSearch) => {
    setSavedSearches(prev => 
      prev?.map(search => 
        search?.id === updatedSearch?.id ? updatedSearch : search
      )
    );
    setShowEditModal(false);
    setEditingSearch(null);
    onDataChange?.();
  };

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'immediate': return 'Zap';
      case 'daily': return 'Calendar';
      case 'weekly': return 'CalendarDays';
      default: return 'Clock';
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'immediate': return 'text-error';
      case 'daily': return 'text-warning';
      case 'weekly': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary font-heading">
              Saved Searches
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage your property search alerts and notification frequency
            </p>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200">
            Create New Search
          </button>
        </div>
      </div>
      <div className="p-6">
        {savedSearches?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={48} className="text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Saved Searches</h3>
            <p className="text-text-secondary mb-4">
              Create your first saved search to get notified about new properties that match your criteria.
            </p>
            <button className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200">
              Create Your First Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches?.map((search) => (
              <div key={search?.id} className="border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-text-primary">{search?.name}</h3>
                      <div className={`flex items-center space-x-1 ${getFrequencyColor(search?.frequency)}`}>
                        <Icon name={getFrequencyIcon(search?.frequency)} size={16} />
                        <span className="text-sm font-medium capitalize">{search?.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          search?.isActive ? 'bg-success' : 'bg-secondary-300'
                        }`}></div>
                        <span className={`text-sm ${
                          search?.isActive ? 'text-success' : 'text-text-secondary'
                        }`}>
                          {search?.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-text-secondary mb-3">
                      <div>
                        <span className="font-medium">Location:</span> {search?.criteria?.location}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {search?.criteria?.propertyType}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span> {search?.criteria?.priceRange}
                      </div>
                      <div>
                        <span className="font-medium">Beds:</span> {search?.criteria?.bedrooms}
                      </div>
                      <div>
                        <span className="font-medium">Baths:</span> {search?.criteria?.bathrooms}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <span>
                        <span className="font-medium text-primary">{search?.resultCount}</span> active listings
                      </span>
                      <span>Last updated: {search?.lastUpdated}</span>
                      <span>Created: {search?.created}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(search?.id)}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        search?.isActive 
                          ? 'text-warning hover:bg-warning-100' :'text-success hover:bg-success-100'
                      }`}
                      title={search?.isActive ? 'Pause alerts' : 'Resume alerts'}
                    >
                      <Icon name={search?.isActive ? 'Pause' : 'Play'} size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(search)}
                      className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
                      title="Edit search"
                    >
                      <Icon name="Edit" size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(search?.id)}
                      className="p-2 rounded-md text-error hover:bg-error-100 transition-colors duration-200"
                      title="Delete search"
                    >
                      <Icon name="Trash2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Edit Modal */}
      {showEditModal && editingSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Saved Search</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  value={editingSearch?.name}
                  onChange={(e) => setEditingSearch(prev => ({ ...prev, name: e?.target?.value }))}
                  className="block w-full px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Notification Frequency
                </label>
                <select
                  value={editingSearch?.frequency}
                  onChange={(e) => setEditingSearch(prev => ({ ...prev, frequency: e?.target?.value }))}
                  className="block w-full px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleSaveEdit(editingSearch)}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSearch(null);
                }}
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

export default SavedSearches;