import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const FeaturedProperties = () => {
  const [savedProperties, setSavedProperties] = useState(new Set());

  const featuredProperties = [
    {
      id: 1,
      title: "Modern Downtown Loft",
      price: 750000,
      location: "Manhattan, NY",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      type: "Condo",
      image: "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      agent: {
        name: "Sarah Johnson",
        photo: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      featured: true,
      daysOnMarket: 5
    },
    {
      id: 2,
      title: "Suburban Family Home",
      price: 485000,
      location: "Austin, TX",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2400,
      type: "House",
      image: "https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
      agent: {
        name: "Michael Chen",
        photo: "https://randomuser.me/api/portraits/men/45.jpg"
      },
      featured: true,
      daysOnMarket: 12
    },
    {
      id: 3,
      title: "Luxury Waterfront Condo",
      price: 1200000,
      location: "Miami, FL",
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1800,
      type: "Condo",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      agent: {
        name: "Elena Rodriguez",
        photo: "https://randomuser.me/api/portraits/women/28.jpg"
      },
      featured: true,
      daysOnMarket: 3
    },
    {
      id: 4,
      title: "Cozy Townhouse",
      price: 320000,
      location: "Portland, OR",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1600,
      type: "Townhouse",
      image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      agent: {
        name: "David Kim",
        photo: "https://randomuser.me/api/portraits/men/33.jpg"
      },
      featured: true,
      daysOnMarket: 8
    },
    {
      id: 5,
      title: "Historic Brownstone",
      price: 950000,
      location: "Boston, MA",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      type: "House",
      image: "https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg",
      agent: {
        name: "Jennifer Walsh",
        photo: "https://randomuser.me/api/portraits/women/41.jpg"
      },
      featured: true,
      daysOnMarket: 15
    },
    {
      id: 6,
      title: "Modern Studio Apartment",
      price: 280000,
      location: "Seattle, WA",
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      type: "Apartment",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      agent: {
        name: "Robert Taylor",
        photo: "https://randomuser.me/api/portraits/men/52.jpg"
      },
      featured: true,
      daysOnMarket: 7
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(price);
  };

  const handleSaveProperty = (propertyId) => {
    setSavedProperties(prev => {
      const newSaved = new Set(prev);
      if (newSaved?.has(propertyId)) {
        newSaved?.delete(propertyId);
      } else {
        newSaved?.add(propertyId);
      }
      return newSaved;
    });
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
            Featured Properties
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties from top locations across the country
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {featuredProperties?.map((property) => (
            <div
              key={property?.id}
              className="bg-surface rounded-lg overflow-hidden shadow-elevation-1 hover:shadow-elevation-3
                       transition-all duration-300 ease-out micro-interaction group"
            >
              {/* Property Image */}
              <div className="relative h-48 lg:h-56 overflow-hidden">
                <Image
                  src={property?.image}
                  alt={property?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-white px-2 py-1 rounded-md text-xs font-medium">
                    {property?.type}
                  </span>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => handleSaveProperty(property?.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200
                           ${savedProperties?.has(property?.id)
                             ? 'bg-error text-white' :'bg-white/90 text-text-secondary hover:bg-white hover:text-error'
                           }`}
                  aria-label={savedProperties?.has(property?.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Icon 
                    name="Heart" 
                    size={16} 
                    fill={savedProperties?.has(property?.id) ? "currentColor" : "none"}
                  />
                </button>

                {/* Days on Market */}
                {property?.daysOnMarket <= 7 && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-success text-white px-2 py-1 rounded-md text-xs font-medium">
                      New Listing
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-4 lg:p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                    {property?.title}
                  </h3>
                  <p className="text-text-secondary text-sm flex items-center">
                    <Icon name="MapPin" size={14} className="mr-1" />
                    {property?.location}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property?.price)}
                  </p>
                </div>

                {/* Property Features */}
                <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Icon name="Bed" size={14} className="mr-1" />
                      {property?.bedrooms} bed
                    </span>
                    <span className="flex items-center">
                      <Icon name="Bath" size={14} className="mr-1" />
                      {property?.bathrooms} bath
                    </span>
                    <span className="flex items-center">
                      <Icon name="Square" size={14} className="mr-1" />
                      {property?.sqft?.toLocaleString()} sqft
                    </span>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={property?.agent?.photo}
                      alt={property?.agent?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-text-secondary">{property?.agent?.name}</span>
                  </div>
                  
                  <Link
                    to={`/property-details?id=${property?.id}`}
                    className="text-sm font-medium text-primary hover:text-primary-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/property-listings"
            className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-md font-semibold
                     hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     transition-all duration-200 ease-out micro-interaction"
          >
            View All Properties
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;