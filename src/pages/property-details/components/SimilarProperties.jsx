// src/pages/property-details/components/SimilarProperties.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const SimilarProperties = ({ properties = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  // Updated property images with latest real estate photos
  const updatePropertyImages = (property) => {
    const updatedImages = [
      "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      "https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      "https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"
    ];

    // Check if property has outdated images
    const hasOutdatedImages = property?.images?.some(img => 
      !img?.includes('w=800') || 
      img?.includes('very-old-image-url') ||
      img?.includes('outdated-photo')
    );

    return {
      ...property,
      images: hasOutdatedImages ? updatedImages : (property?.images || updatedImages)
    };
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
    const newIndex = currentIndex > 0 ? currentIndex - 1 : Math.max(0, properties?.length - 3);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, properties?.length - 3);
    const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  if (!properties?.length) {
    return (
      <div className="text-center py-12">
        <Icon name="Home" size={48} className="text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No Similar Properties
        </h3>
        <p className="text-text-secondary">
          We couldn't find similar properties at this time.
        </p>
      </div>
    );
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
        {properties?.length > 3 && (
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
          {properties?.map((property) => {
            const updatedProperty = updatePropertyImages(property);
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
                      src={updatedProperty?.images?.[0]}
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
        {properties?.length > 1 && (
          <div className="flex md:hidden justify-center space-x-2 mt-4">
            {Array.from({ length: Math.ceil(properties?.length / 1) })?.map((_, index) => (
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