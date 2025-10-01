import React from 'react';
import Icon from '../../../../components/AppIcon';
import { Link } from 'react-router-dom';

const SavedProperties = ({ properties, onRemove, onScheduleShowing }) => {
  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">Saved Properties</h2>
        <Link to="/user-profile-settings" className="text-sm font-medium text-primary hover:underline">View all</Link>
      </div>
      <div className="p-6">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(saved => (
              <div key={saved.id} className="border border-border rounded-lg overflow-hidden group">
                <div className="relative">
                    <img 
                        src={saved.properties.property_images?.find(img => img.is_primary)?.image_url || '/assets/Images/no_image.jpeg'}
                        alt={saved.properties.title} 
                        className="w-full h-48 object-cover"
                    />
                    <button onClick={() => onRemove(saved.id)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-red-500">
                        <Icon name="Trash2" size={16} />
                    </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-text-primary mb-1 truncate">{saved.properties.title}</h3>
                  <p className="text-sm text-text-secondary mb-2 truncate">{saved.properties.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${saved.properties.price.toLocaleString()}</span>
                    <button onClick={() => onScheduleShowing(saved.properties)} className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700">
                        Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Heart" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">You haven't saved any properties yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;
