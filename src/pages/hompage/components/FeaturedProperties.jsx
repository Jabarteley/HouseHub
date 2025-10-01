import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const FeaturedProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState(new Set());

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id, title, price, address, city, state, bedrooms, bathrooms, area_sqft, property_type,
            agent:user_profiles!agent_id(full_name, avatar_url),
            images:property_images(image_url, is_primary)
          `)
          .eq('featured', true)
          .eq('status', 'active')
          .limit(6);

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
        const { data, error } = await supabase
            .from('saved_properties')
            .select('property_id')
            .eq('user_id', user.id);
        if (!error) {
            setSavedProperties(new Set(data.map(p => p.property_id)));
        }
    }
    fetchSaved();
  }, [user]);

  const handleSaveProperty = async (propertyId) => {
    if (!user) return; // Or prompt to login

    const isSaved = savedProperties.has(propertyId);
    
    if (isSaved) {
      const { error } = await supabase.from('saved_properties').delete().match({ user_id: user.id, property_id: propertyId });
      if (!error) {
        setSavedProperties(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      }
    } else {
      const { error } = await supabase.from('saved_properties').insert({ user_id: user.id, property_id: propertyId });
      if (!error) {
        setSavedProperties(prev => new Set(prev).add(propertyId));
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-surface rounded-lg overflow-hidden shadow-elevation-1 animate-pulse">
                        <div className="h-56 bg-secondary-100"></div>
                        <div className="p-6 space-y-3">
                            <div className="h-4 bg-secondary-100 rounded"></div>
                            <div className="h-4 bg-secondary-100 rounded w-2/3"></div>
                            <div className="h-8 bg-secondary-100 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Featured Properties</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">A selection of our finest properties.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <div key={property.id} className="bg-surface rounded-lg overflow-hidden shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 group">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={property.images?.find(img => img.is_primary)?.image_url || '/assets/Images/no_image.jpeg'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleSaveProperty(property.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${savedProperties.has(property.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}>
                  <Icon name="Heart" size={16} fill={savedProperties.has(property.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary truncate">{property.title}</h3>
                <p className="text-sm text-text-secondary mb-3 truncate">{property.address}, {property.city}</p>
                <p className="text-2xl font-bold text-primary mb-4">{formatPrice(property.price)}</p>
                
                <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                    <span className="flex items-center"><Icon name="Bed" size={16} className="mr-1.5"/>{property.bedrooms} beds</span>
                    <span className="flex items-center"><Icon name="Bath" size={16} className="mr-1.5"/>{property.bathrooms} baths</span>
                    <span className="flex items-center"><Icon name="Square" size={16} className="mr-1.5"/>{property.area_sqft} sqft</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Image src={property.agent?.avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt={property.agent?.full_name} className="w-8 h-8 rounded-full" />
                    <span className="text-sm text-text-secondary">{property.agent?.full_name}</span>
                  </div>
                  <Link to={`/property-details?id=${property.id}`} className="text-sm font-medium text-primary hover:underline">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/property-listings" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-700 transition-colors">
            View All Properties <Icon name="ArrowRight" size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;