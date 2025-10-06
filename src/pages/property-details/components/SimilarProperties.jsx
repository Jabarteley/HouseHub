// src/pages/property-details/components/SimilarProperties.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { supabase } from '../../../lib/supabase';

const SimilarProperties = ({ propertyId }) => {
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (propertyId) {
      fetchSimilarProperties();
    }
  }, [propertyId]);

  const fetchSimilarProperties = async () => {
    try {
      setLoading(true);
      // Get the current property to know its type and location for similar properties
      const { data: currentProperty, error: propError } = await supabase
        .from('properties')
        .select('property_type, city, state, bedrooms, bathrooms')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;

      // Find similar properties based on type, location, and similar features
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          address,
          city,
          state,
          bedrooms,
          bathrooms,
          area_sqft,
          property_images!inner (image_url, is_primary)
        `)
        .eq('status', 'active')
        .eq('property_type', currentProperty.property_type)
        .not('id', 'eq', propertyId) // Exclude current property
        .limit(10)
        .order('created_at', { ascending: false });
      
      // Handle the location search more carefully to avoid parsing issues with special characters
      if (currentProperty.city && currentProperty.state) {
        // Instead of using OR with raw strings that might contain special characters,
        // we'll fetch with one condition and then use client-side filtering if needed
        query = query.eq('city', currentProperty.city);
      } else if (currentProperty.city) {
        query = query.eq('city', currentProperty.city);
      } else if (currentProperty.state) {
        query = query.eq('state', currentProperty.state);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      // Format the properties
      const formattedProps = data?.map(prop => ({
        id: prop.id,
        title: prop.title,
        price: prop.price,
        address: `${prop.address}, ${prop.city}, ${prop.state}`,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.area_sqft,
        images: prop.property_images?.map(img => img.image_url) || []
      })) || [];

      setSimilarProperties(formattedProps);
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      setSimilarProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US')?.format(num);
  };

  const scrollToIndex = (index) => {
    if (containerRef?.current) {
      const cardWidth = containerRef?.current?.children?.[0]?.offsetWidth || 0;
      const gap = 16; // gap-4 = 1rem = 16px
      const scrollPosition = index * (cardWidth + gap);
      
      containerRef?.current?.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : Math.max(0, similarProperties?.length - 3);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, similarProperties?.length - 3);
    const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Similar Properties</h2>
            <p className="text-text-secondary">Properties you might also like</p>
          </div>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex-shrink-0 w-80 md:w-96 animate-pulse">
              <div className="bg-surface rounded-lg shadow-elevation-1 overflow-hidden">
                <div className="w-full h-48 bg-secondary-100 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-secondary-100 rounded w-3/4"></div>
                  <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                  <div className="h-4 bg-secondary-100 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!similarProperties?.length) {
    return null; // Don't render anything if no similar properties
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Similar Properties</h2>
          <p className="text-text-secondary">Properties you might also like</p>
        </div>
        
        {/* Desktop Navigation */}
        {similarProperties?.length > 3 && (
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 border border-border rounded-md hover:bg-secondary-100 transition-all duration-200"
              aria-label="Previous properties"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-border rounded-md hover:bg-secondary-100 transition-all duration-200"
              aria-label="Next properties"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        )}
      </div>
      {/* Properties Carousel */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {similarProperties?.map((property) => {
            return (
              <Link
                key={property?.id}
                to={`/property-details?id=${property?.id}`}
                className="flex-shrink-0 w-80 md:w-96 group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="card hover:shadow-elevation-3 transition-all duration-200 overflow-hidden">
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={property?.images?.[0] || '/assets/Images/no_image.jpeg'}
                      alt={property?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e?.preventDefault();
                          e?.stopPropagation();
                          // Handle save action
                        }}
                        className="p-2 bg-surface/90 rounded-full hover:bg-surface transition-all duration-200"
                        aria-label="Save property"
                      >
                        <Icon name="Heart" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {property?.title}
                      </h3>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(property?.price)}
                      </p>
                    </div>
                    
                    <p className="text-text-secondary text-sm mb-3 line-clamp-1">
                      {property?.address}
                    </p>
                    
                    {/* Property Features */}
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <Icon name="Bed" size={14} />
                        <span>{property?.bedrooms}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Bath" size={14} />
                        <span>{property?.bathrooms}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Square" size={14} />
                        <span>{formatNumber(property?.sqft)} sq ft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation Dots */}
        {similarProperties?.length > 1 && (
          <div className="flex md:hidden justify-center space-x-2 mt-4">
            {Array.from({ length: Math.ceil(similarProperties?.length / 1) })?.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-primary' : 'bg-secondary-300'
                }`}
                aria-label={`Go to property ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* View All Link */}
      <div className="text-center pt-4">
        <Link
          to="/property-listings"
          className="inline-flex items-center space-x-2 text-primary hover:text-primary-700 font-medium transition-colors duration-200"
        >
          <span>View All Properties</span>
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
    </div>
  );
};

export default SimilarProperties;