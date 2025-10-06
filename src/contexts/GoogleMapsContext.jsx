import React, { createContext, useContext, useEffect, useState } from 'react';

const GoogleMapsContext = createContext();

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        setIsLoaded(true);
        return;
      }

      // Check for API key
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not found in environment variables');
        return;
      }

      // Check if script is already in the document
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for the existing script to load
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            setIsLoaded(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoading(true);
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsLoaded(true);
          setLoading(false);
          resolve();
        };
        script.onerror = (error) => {
          console.error('Error loading Google Maps script:', error);
          setLoading(false);
          reject(error);
        };
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps();
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loading }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};