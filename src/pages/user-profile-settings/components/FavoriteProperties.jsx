// src/pages/user-profile-settings/components/FavoriteProperties.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FavoriteProperties = ({ user, onDataChange }) => {
  const [favoriteProperties, setFavoriteProperties] = useState([
    {
      id: '1',
      title: 'Modern Downtown Condo',
      address: '123 Main Street, Unit 4B',
      price: '$425,000',
      beds: 2,
      baths: 2,
      sqft: 1200,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      dateAdded: '2024-01-10',
      status: 'active',
      listingAgent: 'Sarah Johnson',
      lastPriceChange: null
    },
    {
      id: '2',
      title: 'Charming Suburban Home',
      address: '456 Oak Avenue',
      price: '$675,000',
      beds: 4,
      baths: 3,
      sqft: 2400,
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
      dateAdded: '2024-01-08',
      status: 'price_drop',
      listingAgent: 'Mike Chen',
      lastPriceChange: '-$25,000'
    },
    {
      id: '3',
      title: 'Luxury Waterfront Villa',
      address: '789 Lakeside Drive',
      price: '$1,250,000',
      beds: 5,
      baths: 4,
      sqft: 3800,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      dateAdded: '2024-01-05',
      status: 'sold',
      listingAgent: 'Lisa Rodriguez',
      lastPriceChange: null
    }
  ]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterBy, setFilterBy] = useState('all');

  const handleRemoveFavorite = (propertyId) => {
    if (window.confirm('Remove this property from your favorites?')) {
      setFavoriteProperties(prev => prev?.filter(prop => prop?.id !== propertyId));
      setSelectedProperties(prev => prev?.filter(id => id !== propertyId));
      onDataChange?.();
    }
  };

  const handleBulkRemove = () => {
    if (selectedProperties?.length === 0) return;
    
    if (window.confirm(`Remove ${selectedProperties?.length} properties from your favorites?`)) {
      setFavoriteProperties(prev => prev?.filter(prop => !selectedProperties?.includes(prop?.id)));
      setSelectedProperties([]);
      onDataChange?.();
    }
  };

  const handleSelectProperty = (propertyId) => {
    setSelectedProperties(prev => 
      prev?.includes(propertyId)
        ? prev?.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    let filtered = getFilteredProperties();
    if (selectedProperties?.length === filtered?.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filtered?.map(prop => prop?.id));
    }
  };

  const handleShare = () => {
    if (selectedProperties?.length === 0) {
      alert('Please select properties to share');
      return;
    }
    setShowShareModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-success-100 text-success px-2 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'price_drop':
        return <span className="bg-warning-100 text-warning px-2 py-1 rounded-full text-xs font-medium">Price Drop</span>;
      case 'sold':
        return <span className="bg-secondary-100 text-text-secondary px-2 py-1 rounded-full text-xs font-medium">Sold</span>;
      default:
        return null;
    }
  };

  const getFilteredProperties = () => {
    let filtered = favoriteProperties;
    
    if (filterBy !== 'all') {
      filtered = filtered?.filter(prop => prop?.status === filterBy);
    }
    
    return filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'price':
          return parseInt(b?.price?.replace(/[^0-9]/g, '')) - parseInt(a?.price?.replace(/[^0-9]/g, ''));
        case 'title':
          return a?.title?.localeCompare(b?.title);
        default:
          return 0;
      }
    });
  };

  const filteredProperties = getFilteredProperties();

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary font-heading">
              Favorite Properties
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {favoriteProperties?.length} saved properties
            </p>
          </div>
          
          {/* Controls */}
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="all">All Properties</option>
              <option value="active">Active Only</option>
              <option value="price_drop">Price Drops</option>
              <option value="sold">Sold</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="dateAdded">Date Added</option>
              <option value="price">Price</option>
              <option value="title">Name</option>
            </select>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedProperties?.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-primary-100 rounded-lg">
            <span className="text-sm font-medium text-primary">
              {selectedProperties?.length} properties selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
              >
                Share
              </button>
              <button
                onClick={handleBulkRemove}
                className="text-error hover:text-error-600 text-sm font-medium transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        {filteredProperties?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Heart" size={48} className="text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {favoriteProperties?.length === 0 ? 'No Favorite Properties' : 'No Properties Match Filter'}
            </h3>
            <p className="text-text-secondary">
              {favoriteProperties?.length === 0 
                ? 'Start browsing properties and save your favorites here.' :'Try adjusting your filter settings to see more properties.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedProperties?.length === filteredProperties?.length && filteredProperties?.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-text-primary">
                Select All
              </label>
            </div>
            
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProperties?.map((property) => (
                <div key={property?.id} className="border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={property?.image}
                      alt={property?.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                    
                    {/* Checkbox Overlay */}
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedProperties?.includes(property?.id)}
                        onChange={() => handleSelectProperty(property?.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-white rounded bg-white bg-opacity-90"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(property?.status)}
                    </div>
                    
                    {/* Price Change Badge */}
                    {property?.lastPriceChange && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-warning text-white px-2 py-1 rounded text-xs font-medium">
                          {property?.lastPriceChange}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-text-primary">{property?.title}</h3>
                      <button
                        onClick={() => handleRemoveFavorite(property?.id)}
                        className="text-error hover:bg-error-100 p-1 rounded transition-colors duration-200"
                        title="Remove from favorites"
                      >
                        <Icon name="Heart" size={20} className="fill-current" />
                      </button>
                    </div>
                    
                    <p className="text-text-secondary text-sm mb-2">{property?.address}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">{property?.price}</span>
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <span>{property?.beds} bed</span>
                        <span>{property?.baths} bath</span>
                        <span>{property?.sqft?.toLocaleString()} sqft</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>Agent: {property?.listingAgent}</span>
                      <span>Added: {property?.dateAdded}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Share Properties</h3>
            
            <p className="text-text-secondary mb-4">
              Share {selectedProperties?.length} selected properties via:
            </p>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary-100 transition-colors duration-200">
                <Icon name="Mail" size={20} className="text-primary" />
                <span>Email</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary-100 transition-colors duration-200">
                <Icon name="Share" size={20} className="text-primary" />
                <span>Copy Link</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary-100 transition-colors duration-200">
                <Icon name="Download" size={20} className="text-primary" />
                <span>Export as PDF</span>
              </button>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
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

export default FavoriteProperties;