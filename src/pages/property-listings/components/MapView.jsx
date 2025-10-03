import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MapView = ({ 
  properties = [], 
  selectedProperty, 
  onPropertySelect,
  isMobile = false 
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(11);
  const [hoveredProperty, setHoveredProperty] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(price);
  };

  // Calculate map bounds based on properties with coordinates
  useEffect(() => {
    if (properties?.length > 0) {
      // Filter properties that have valid coordinates
      const validProperties = properties?.filter(p => p?.coordinates && p?.coordinates?.lat && p?.coordinates?.lng);
      if (validProperties?.length > 0) {
        const lats = validProperties?.map(p => p?.coordinates?.lat);
        const lngs = validProperties?.map(p => p?.coordinates?.lng);
        
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        
        setMapCenter({ lat: centerLat, lng: centerLng });
      } else {
        // Default to a location based on the first property's address or a general location
        const firstProperty = properties?.[0];
        if (firstProperty?.address?.toLowerCase()?.includes('nigeria')) {
          // Default to Lagos, Nigeria
          setMapCenter({ lat: 6.5244, lng: 3.3792 });
        } else if (firstProperty?.address?.toLowerCase()?.includes('kenya')) {
          // Default to Nairobi, Kenya
          setMapCenter({ lat: -1.2864, lng: 36.8172 });
        } else {
          // Default to New York as fallback
          setMapCenter({ lat: 40.7128, lng: -74.0060 });
        }
      }
    }
  }, [properties]);

  const handleMarkerClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 8));
  };

  return (
    <div className="relative h-full bg-secondary-100">
      {/* Map Container */}
      <div className="w-full h-full relative overflow-hidden">
        {/* Google Maps Iframe - Use actual coordinates if available */}
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Property Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=${zoom}&output=embed`}
          className="absolute inset-0"
        />

        {/* Property Markers Overlay - only show for properties with valid coordinates */}
        <div className="absolute inset-0 pointer-events-none">
          {properties?.map((property) => {
            // Only show markers for properties with valid coordinates
            if (property?.coordinates && property?.coordinates?.lat && property?.coordinates?.lng) {
              // Calculate marker position based on relative coordinates
              // This is a simplified approach since we can't directly overlay markers on Google Maps iframe
              const markerStyle = {
                position: 'absolute',
                left: `${Math.random() * 80 + 10}%`, // Random positioning as a placeholder since we can't overlay on iframe
                top: `${Math.random() * 80 + 10}%`,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'auto'
              };

              return (
                <div
                  key={property?.id}
                  style={markerStyle}
                  className="relative"
                >
                  {/* Price Marker */}
                  <button
                    onClick={() => handleMarkerClick(property)}
                    onMouseEnter={() => setHoveredProperty(property)}
                    onMouseLeave={() => setHoveredProperty(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-elevation-2
                             transition-all duration-200 ease-out micro-interaction ${
                      selectedProperty?.id === property?.id
                        ? 'bg-primary text-white scale-110'
                        : hoveredProperty?.id === property?.id
                        ? 'bg-accent text-white scale-105' :'bg-surface text-text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {formatPrice(property?.price)?.replace('.00', '')}
                  </button>
                  {/* Property Card Popup */}
                  {(hoveredProperty?.id === property?.id || selectedProperty?.id === property?.id) && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                                  w-64 bg-surface rounded-lg shadow-elevation-4 border border-border
                                  z-dropdown">
                      <div className="p-3">
                        {/* Property Image */}
                        <div className="relative h-32 mb-3 overflow-hidden rounded-md">
                          <Image
                            src={property?.images?.[0]}
                            alt={property?.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-surface/90 rounded-full p-1">
                            <Icon 
                              name={property?.isSaved ? "Heart" : "Heart"} 
                              size={14} 
                              className={property?.isSaved ? "text-error" : "text-text-secondary"}
                              fill={property?.isSaved ? "currentColor" : "none"}
                            />
                          </div>
                        </div>

                        {/* Property Details */}
                        <div>
                          <h4 className="font-semibold text-text-primary text-sm mb-1 truncate">
                            {property?.title}
                          </h4>
                          <p className="text-lg font-bold text-primary mb-2">
                            {formatPrice(property?.price)}
                          </p>
                          <p className="text-xs text-text-secondary mb-2 truncate">
                            {property?.address}
                          </p>

                          {/* Property Features */}
                          <div className="flex items-center space-x-3 text-xs text-text-secondary mb-3">
                            <div className="flex items-center space-x-1">
                              <Icon name="Bed" size={12} />
                              <span>{property?.bedrooms}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Icon name="Bath" size={12} />
                              <span>{property?.bathrooms}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Icon name="Square" size={12} />
                              <span>{property?.area_sqft || property?.sqft}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button className="flex-1 bg-primary text-white px-3 py-1.5 rounded-md 
                                             text-xs font-medium hover:bg-primary-700 
                                             transition-colors duration-200">
                              View Details
                            </button>
                            <button className="px-2 py-1.5 bg-secondary-100 text-text-secondary 
                                             rounded-md hover:bg-secondary-200 
                                             transition-colors duration-200">
                              <Icon name="Phone" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Popup Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 
                                      border-l-transparent border-r-transparent border-t-border"></div>
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 
                                      border-l-transparent border-r-transparent border-t-surface
                                      relative -top-px"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null; // Don't render anything for properties without coordinates
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {/* Zoom Controls */}
          <div className="bg-surface rounded-md shadow-elevation-2 border border-border overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="block w-10 h-10 flex items-center justify-center text-text-secondary 
                       hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
            >
              <Icon name="Plus" size={16} />
            </button>
            <div className="border-t border-border"></div>
            <button
              onClick={handleZoomOut}
              className="block w-10 h-10 flex items-center justify-center text-text-secondary 
                       hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
            >
              <Icon name="Minus" size={16} />
            </button>
          </div>

          {/* Map Type Toggle */}
          <button className="w-10 h-10 bg-surface rounded-md shadow-elevation-2 border border-border
                           flex items-center justify-center text-text-secondary 
                           hover:text-text-primary hover:bg-secondary-100 
                           transition-colors duration-200">
            <Icon name="Layers" size={16} />
          </button>

          {/* Current Location */}
          <button className="w-10 h-10 bg-surface rounded-md shadow-elevation-2 border border-border
                           flex items-center justify-center text-text-secondary 
                           hover:text-text-primary hover:bg-secondary-100 
                           transition-colors duration-200">
            <Icon name="Navigation" size={16} />
          </button>
        </div>

        {/* Search This Area Button */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <button className="bg-surface text-text-primary px-4 py-2 rounded-full 
                           shadow-elevation-2 border border-border text-sm font-medium
                           hover:bg-secondary-100 transition-all duration-200 ease-out
                           micro-interaction">
            <Icon name="Search" size={14} className="inline mr-2" />
            Search this area
          </button>
        </div>

        {/* Property Count Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-surface text-text-primary px-3 py-2 rounded-full 
                        shadow-elevation-2 border border-border text-sm font-medium">
            {properties?.length} properties
          </div>
        </div>

        {/* Mobile: Back to List Button */}
        {isMobile && (
          <div className="absolute bottom-4 right-4">
            <button className="bg-primary text-white px-4 py-2 rounded-full 
                             shadow-elevation-2 text-sm font-medium
                             hover:bg-primary-700 transition-all duration-200 ease-out
                             micro-interaction">
              <Icon name="List" size={14} className="inline mr-2" />
              Back to List
            </button>
          </div>
        )}
      </div>
      {/* Loading Overlay */}
      {properties?.length === 0 && (
        <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full 
                          animate-spin mx-auto mb-3"></div>
            <p className="text-text-secondary text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;