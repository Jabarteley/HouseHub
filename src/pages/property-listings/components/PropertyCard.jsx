import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const PropertyCard = ({
  property,
  variant = 'card',
  onSave,
  isHighlighted = false
}) => {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(property?.isSaved || false);

  useEffect(() => {
    setIsSaved(property?.isSaved || false);
  }, [property?.isSaved]);

  // Handle different image data structures
  let displayImages = [];
  if (property?.property_images && Array.isArray(property?.property_images)) {
    // New format from database
    const primaryImage = property?.property_images?.find(img => img.is_primary)?.image_url;
    const otherImages = property?.property_images?.filter(img => !img.is_primary).map(img => img.image_url);
    displayImages = primaryImage ? [primaryImage, ...otherImages] : otherImages;
  } else if (property?.images && Array.isArray(property?.images)) {
    // Legacy format (mock data or different structure)
    displayImages = property?.images;
  }
  
  const primaryImage = displayImages[0] || '/assets/Images/no_image.jpeg';

  const formatPrice = (price) => {
    // For multi-unit properties, handle price range
    if (property.price_range) {
      return property.price_range;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to save properties.');
      return;
    }

    if (isSaved) {
      const { error } = await supabase.from('saved_properties').delete().match({ user_id: user.id, property_id: property.id });
      if (!error) {
        setIsSaved(false);
        if (onSave) onSave(property.id, false);
      } else {
        console.error('Error unsaving property:', error);
      }
    } else {
      const { error } = await supabase.from('saved_properties').insert({ user_id: user.id, property_id: property.id });
      if (!error) {
        setIsSaved(true);
        if (onSave) onSave(property.id, true);
      } else {
        console.error('Error saving property:', error);
      }
    }
  };

  const handleImageNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === displayImages.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? displayImages.length - 1 : prev - 1
      );
    }
  };

  const handleContactAgent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle contact agent action - assuming agent phone is available on property.agent.phone
    if (property.agent?.phone) {
      window.open(`tel:${property.agent.phone}`, '_self');
    } else {
      alert('Agent phone number not available.');
    }
  };

  if (variant === 'list') {
    return (
      <Link
        to={`/property-details?id=${property.id}${property.total_units > 1 ? '&multi_unit=true' : ''}`}
        className={`block bg-surface rounded-lg shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 ease-out
                   ${isHighlighted ? 'ring-2 ring-primary shadow-elevation-2' : ''}`}
      >
        <div className="p-4">
          <div className="flex space-x-4">
            {/* Property Images */}
            <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-md group">
              <Image
                src={displayImages[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Image Navigation */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => handleImageNavigation('prev', e)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 
                             bg-surface/90 rounded-full flex items-center justify-center
                             hover:bg-surface transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Icon name="ChevronLeft" size={14} className="text-text-primary" />
                  </button>
                  <button
                    onClick={(e) => handleImageNavigation('next', e)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 
                             bg-surface/90 rounded-full flex items-center justify-center
                             hover:bg-surface transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Icon name="ChevronRight" size={14} className="text-text-primary" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                              flex space-x-1">
                  {displayImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                           transition-all duration-200 ease-out ${isSaved ? 'bg-error text-white' : 'bg-surface/90 text-text-secondary hover:bg-surface hover:text-error'}`}
              >
                <Icon 
                  name="Heart" 
                  size={16} 
                  fill={isSaved ? "currentColor" : "none"} 
                />
              </button>
            </div>

            {/* Property Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary truncate">
                    {property.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </p>
                    {/* Show unit availability for multi-unit properties */}
                    {property.total_units > 1 && (
                      <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded-full">
                        {property.available_units} of {property.total_units} available
                      </span>
                    )}
                  </div>
                </div>
                
                {property.daysOnMarket <= 7 && (
                  <span className="bg-success-100 text-success px-2 py-1 rounded-md text-xs font-medium">
                    New
                  </span>
                )}
              </div>

              <p className="text-text-secondary text-sm mb-3 truncate">
                {property.address}, {property.city}
              </p>

              {/* Property Features */}
              <div className="flex items-center space-x-4 mb-3 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="Bed" size={16} />
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Bath" size={16} />
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Square" size={16} />
                  <span>{formatNumber(property.area_sqft || property.sqft)} sqft</span>
                </div>
              </div>

              {/* Agent Info & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={property.agent?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={property.agent?.full_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-text-secondary">
                    {property.agent?.full_name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleContactAgent}
                    className="px-3 py-1.5 bg-accent-100 text-accent-600 rounded-md text-sm font-medium hover:bg-accent-500 hover:text-white transition-all duration-200 ease-out"
                  >
                    Contact
                  </button>
                  <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200 ease-out">
                    Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Card variant for mobile/grid view
  return (
    <Link
      to={`/property-details?id=${property.id}${property.total_units > 1 ? '&multi_unit=true' : ''}`}
      className="block bg-surface rounded-lg shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 ease-out micro-interaction"
    >
      {/* Property Images */}
      <div className="relative h-48 overflow-hidden rounded-t-lg group">
        <Image
          src={displayImages[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Image Navigation */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => handleImageNavigation('prev', e)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 
                       bg-surface/90 rounded-full flex items-center justify-center
                       hover:bg-surface transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <Icon name="ChevronLeft" size={16} className="text-text-primary" />
            </button>
            <button
              onClick={(e) => handleImageNavigation('next', e)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 
                       bg-surface/90 rounded-full flex items-center justify-center
                       hover:bg-surface transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <Icon name="ChevronRight" size={16} className="text-text-primary" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 
                        flex space-x-1">
            {displayImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center
                     transition-all duration-200 ease-out ${isSaved ? 'bg-error text-white' : 'bg-surface/90 text-text-secondary hover:bg-surface hover:text-error'}`}
        >
          <Icon 
            name="Heart" 
            size={18} 
            fill={isSaved ? "currentColor" : "none"} 
          />
        </button>

        {/* New Badge */}
        {property.daysOnMarket <= 7 && (
          <div className="absolute top-3 left-3 bg-success text-white px-2 py-1 rounded-md text-xs font-medium">
            New
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate">
              {property.title}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-xl font-bold text-primary">
                {formatPrice(property.price)}
              </p>
              {/* Show unit availability for multi-unit properties */}
              {property.total_units > 1 && (
                <span className="text-xs bg-success-100 text-success-800 px-1.5 py-0.5 rounded-full">
                  {property.available_units} of {property.total_units} available
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-text-secondary text-sm mb-3 truncate">
          {property.address}, {property.city}
        </p>

        {/* Property Features */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-text-secondary">
          <div className="flex items-center space-x-1">
            <Icon name="Bed" size={16} />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Bath" size={16} />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Square" size={16} />
            <span>{formatNumber(property.area_sqft || property.sqft)} sqft</span>
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Image
              src={property.agent?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={property.agent?.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {property.agent?.full_name}
              </p>
              <p className="text-xs text-text-secondary">
                {property.agent?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleContactAgent}
              className="p-2 bg-accent-100 text-accent-600 rounded-md hover:bg-accent-500 hover:text-white transition-all duration-200 ease-out"
            >
              <Icon name="Phone" size={16} />
            </button>
            <button className="p-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-all duration-200 ease-out">
              <Icon name="Calendar" size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;