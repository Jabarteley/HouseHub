import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';

const PropertyList = ({ properties, onStatusChange, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProperties = activeTab === 'all' 
    ? properties 
    : properties.filter(p => p.status === activeTab);

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">My Properties</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'draft' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'active' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {filteredProperties.length > 0 ? (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium text-text-primary mr-2">{property.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' :
                        property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        property.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        property.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{property.address}, {property.city}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center">
                        <Icon name="DollarSign" size={14} className="mr-1" />
                        {property.price?.toLocaleString()} 
                      </span>
                      <span className="flex items-center">
                        <Icon name="Home" size={14} className="mr-1" />
                        {property.property_type}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Bed" size={14} className="mr-1" />
                        {property.bedrooms} bed
                      </span>
                      <span className="flex items-center">
                        <Icon name="Bath" size={14} className="mr-1" />
                        {property.bathrooms} bath
                      </span>
                      <span className="flex items-center">
                        <Icon name="Ruler" size={14} className="mr-1" />
                        {property.area_sqft} sqft
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEdit && onEdit(property)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Property"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <select
                        value={property.status}
                        onChange={(e) => onStatusChange(property.id, e.target.value)}
                        className="text-xs border border-border rounded px-2 py-1 bg-background"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="rented">Rented</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => onDelete(property.id)} 
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Property"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-medium text-text-primary">No properties {activeTab !== 'all' ? activeTab : ''}</h3>
            <p className="text-text-secondary mt-1">
              {activeTab === 'all' 
                ? "You haven't listed any properties yet." 
                : `You don't have any ${activeTab} properties.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
