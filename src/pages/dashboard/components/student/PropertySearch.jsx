import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const PropertySearch = ({ onPropertySelect }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: 'any',
    bedrooms: '',
    bathrooms: ''
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

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
          area_sqft,
          status,
          created_at,
          property_images (image_url, is_primary),
          user_profiles!properties_landlord_id_fkey (full_name)
        `)
        .eq('status', 'active') // Only show active properties
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (error.code === 'PGRST205') {
        console.warn('Properties table not found. Please run the migration to create the required tables.');
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...properties];

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(p => 
        p.address.toLowerCase().includes(locationLower) ||
        p.city.toLowerCase().includes(locationLower) ||
        p.state.toLowerCase().includes(locationLower)
      );
    }

    if (filters.minPrice) {
      result = result.filter(p => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      result = result.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    if (filters.propertyType && filters.propertyType !== 'any') {
      result = result.filter(p => p.property_type.toLowerCase() === filters.propertyType.toLowerCase());
    }

    if (filters.bedrooms) {
      result = result.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }

    if (filters.bathrooms) {
      result = result.filter(p => p.bathrooms >= parseInt(filters.bathrooms));
    }

    setFilteredProperties(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="h-10 bg-secondary-100 rounded"></div>
          <div className="h-10 bg-secondary-100 rounded"></div>
          <div className="h-10 bg-secondary-100 rounded"></div>
          <div className="h-10 bg-secondary-100 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Find Your Perfect Property</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-secondary-100 text-text-secondary'}`}
            >
              <Icon name="List" size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-secondary-100 text-text-secondary'}`}
            >
              <Icon name="Grid3X3" size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="City, State, or Address"
              className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min"
              className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max"
              className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Property Type</label>
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
            >
              <option value="any">Any Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Bedrooms</label>
            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredProperties.length > 0 ? (
          viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredProperties.map(property => (
                <div 
                  key={property.id} 
                  className="border border-border rounded-lg p-4 hover:bg-secondary-100 transition-colors cursor-pointer"
                  onClick={() => onPropertySelect && onPropertySelect(property)}
                >
                  <div className="flex">
                    <div className="w-1/4 mr-4">
                      <img 
                        src={property.property_images?.find(img => img.is_primary)?.image_url || '/assets/Images/no_image.jpeg'}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-text-primary">{property.title}</h3>
                        <span className="font-bold text-primary">{formatPrice(property.price)}</span>
                      </div>
                      <p className="text-sm text-text-secondary mb-1">{property.address}, {property.city}, {property.state}</p>
                      <div className="flex items-center text-sm text-text-secondary space-x-4">
                        <span>{property.bedrooms} bd</span>
                        <span>{property.bathrooms} ba</span>
                        <span>{property.area_sqft} sqft</span>
                        <span className="capitalize">{property.property_type}</span>
                      </div>
                      <p className="text-xs text-text-tertiary mt-2">Listed by: {property.user_profiles?.full_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <div 
                  key={property.id} 
                  className="border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-shadow cursor-pointer"
                  onClick={() => onPropertySelect && onPropertySelect(property)}
                >
                  <div className="relative">
                    <img 
                      src={property.property_images?.find(img => img.is_primary)?.image_url || '/assets/Images/no_image.jpeg'}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-text-primary truncate">{property.title}</h3>
                      <span className="font-bold text-primary">{formatPrice(property.price)}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2 truncate">{property.address}</p>
                    <div className="flex items-center text-sm text-text-secondary space-x-3">
                      <span>{property.bedrooms} bd</span>
                      <span>{property.bathrooms} ba</span>
                      <span>{property.area_sqft} sqft</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-2">By {property.user_profiles?.full_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No properties match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;