import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const MapView = ({ onPropertySelect }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          address,
          city,
          state,
          price,
          property_type,
          bedrooms,
          bathrooms,
          latitude,
          longitude,
          property_images (image_url, is_primary)
        `)
        .eq('status', 'active') // Only show active properties
        .not('latitude', 'is', null) // Only properties with location data
        .not('longitude', 'is', null);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties for map:', error);
      if (error.code === 'PGRST205') {
        console.warn('Properties table not found. Please run the migration to create the required tables.');
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Simple mock map visualization 
  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-secondary-100 rounded-lg"></div>
      </div>
    );
  }

  // For now, we'll create a simple visualization since we don't have a real map library
  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Property Locations</h2>
      </div>
      <div className="p-6">
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-96 relative overflow-hidden">
          {/* Mock map with property markers */}
          {properties.length > 0 ? (
            <>
              {/* Mock map background */}
              <div className="absolute inset-0 bg-gradient-to-b from-green-100 to-blue-100"></div>
              
              {/* Property markers */}
              {properties.map((property, index) => {
                // Calculate random positions for demo purposes
                const top = 20 + (index * 15) % 70;
                const left = 10 + (index * 25) % 80;
                
                return (
                  <div
                    key={property.id}
                    className={`absolute w-6 h-6 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white text-xs font-bold z-10 ${
                      selectedProperty?.id === property.id ? 'bg-red-600 ring-4 ring-red-300' : 'bg-blue-600'
                    }`}
                    style={{ top: `${top}%`, left: `${left}%` }}
                    onClick={() => {
                      setSelectedProperty(property);
                      onPropertySelect && onPropertySelect(property);
                    }}
                    title={property.title}
                  >
                    ${Math.round(property.price / 1000)}
                  </div>
                );
              })}
              
              {/* Selected property info panel */}
              {selectedProperty && (
                <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs w-64 border border-border">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-text-primary">{selectedProperty.title}</h3>
                    <button 
                      onClick={() => setSelectedProperty(null)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{selectedProperty.address}</p>
                  <div className="flex items-center text-sm text-text-secondary space-x-3 mb-2">
                    <span>{selectedProperty.bedrooms} bd</span>
                    <span>{selectedProperty.bathrooms} ba</span>
                    <span className="capitalize">{selectedProperty.property_type}</span>
                  </div>
                  <p className="font-bold text-primary">{formatPrice(selectedProperty.price)}</p>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-text-secondary">
                <Icon name="MapPin" size={48} className="mx-auto mb-2" />
                <p>No properties with location data available</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Property list below the map */}
        <div className="mt-6">
          <h3 className="font-medium text-text-primary mb-3">Available Properties</h3>
          <div className="space-y-3">
            {properties.map(property => (
              <div
                key={property.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                  selectedProperty?.id === property.id 
                    ? 'border-primary bg-primary-50' 
                    : 'border-border hover:bg-secondary-100'
                }`}
                onClick={() => {
                  setSelectedProperty(property);
                  onPropertySelect && onPropertySelect(property);
                }}
              >
                <div className="w-16 h-16 mr-3 flex-shrink-0">
                  <img 
                    src={property.property_images?.find(img => img.is_primary)?.image_url || '/assets/Images/no_image.jpeg'}
                    alt={property.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary text-sm">{property.title}</h4>
                  <p className="text-xs text-text-secondary truncate">{property.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{formatPrice(property.price)}</p>
                  <p className="text-xs text-text-secondary">{property.bedrooms}bd {property.bathrooms}ba</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;