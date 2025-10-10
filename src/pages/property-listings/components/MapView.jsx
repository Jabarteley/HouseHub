import React, { useState, useEffect, useRef } from 'react';
import { useGoogleMaps } from '../../../contexts/GoogleMapsContext';
import Icon from '../../../components/AppIcon';

const MapView = ({ 
  properties = [], 
  selectedProperty, 
  onPropertySelect,
  isMobile = false 
}) => {
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(11);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef({});

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
        // Default to a location based on the first property's address
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

  // Initialize map
  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !googleMapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Initial center, will be updated
        zoom: 11, // Initial zoom
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
      googleMapRef.current = map;
      setMapLoaded(true);
    }
  }, [googleMapsLoaded]);

  // Update map center and zoom
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(mapCenter);
      googleMapRef.current.setZoom(zoom);
    }
  }, [mapCenter, zoom]);

  // Update markers
  useEffect(() => {
    if (!googleMapRef.current || !googleMapsLoaded) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
    markersRef.current = {};

    // Add new markers
    properties.forEach((property) => {
      if (property?.coordinates?.lat && property?.coordinates?.lng) {
        // Use traditional Marker API for better compatibility
        const marker = new window.google.maps.Marker({
          position: {
            lat: property.coordinates.lat,
            lng: property.coordinates.lng,
          },
          map: googleMapRef.current,
          title: property.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor:
              selectedProperty?.id === property.id ? "#0EA5E9" : "#FFFFFF",
            fillOpacity: 1,
            strokeColor:
              selectedProperty?.id === property.id ? "#0EA5E9" : "#3B82F6",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          if (onPropertySelect) {
            onPropertySelect(property);
          }
        });

        markersRef.current[property.id] = marker;
      }
    });
  }, [properties, selectedProperty, googleMapsLoaded, onPropertySelect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
    };
  }, []);

  const handleMarkerClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const handleZoomIn = () => {
    if (googleMapsLoaded && googleMapRef.current) {
      const newZoom = Math.min(googleMapRef.current.getZoom() + 1, 18);
      googleMapRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (googleMapsLoaded && googleMapRef.current) {
      const newZoom = Math.max(googleMapRef.current.getZoom() - 1, 8);
      googleMapRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  return (
    <div className="relative h-full bg-secondary-100">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full"
      />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-100 pointer-events-none">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full 
                            animate-spin mx-auto mb-3"></div>
              <p className="text-text-secondary text-sm">Loading map...</p>
            </div>
          </div>
        )}

      {/* Map Controls */}
      {mapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {/* Zoom Controls */}
          <div className="bg-surface rounded-md shadow-elevation-2 border border-border overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="block w-10 h-10 flex items-center justify-center text-text-secondary 
                       hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
              aria-label="Zoom in"
            >
              <Icon name="Plus" size={16} />
            </button>
            <div className="border-t border-border"></div>
            <button
              onClick={handleZoomOut}
              className="block w-10 h-10 flex items-center justify-center text-text-secondary 
                       hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
              aria-label="Zoom out"
            >
              <Icon name="Minus" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Property Count Badge */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-surface text-text-primary px-3 py-2 rounded-full 
                        shadow-elevation-2 border border-border text-sm font-medium">
            {properties?.length} properties
          </div>
        </div>
      )}

      {/* Mobile: Back to List Button */}
      {isMobile && mapLoaded && (
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
  );
};

export default MapView;