import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

import PropertyCard from './components/PropertyCard';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import SortDropdown from './components/SortDropdown';

const PropertyListings = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  // Fetch properties from database
  useEffect(() => {
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data: propertiesData, error: propertiesError } = await supabase
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
          property_images!inner (id, image_url, is_primary),
          agent:user_profiles!properties_agent_id_fkey (id, full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // If user is authenticated, fetch their saved properties
      let savedProperties = [];
      if (user) {
        const { data: savedData, error: savedError } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id);

        if (!savedError) {
          savedProperties = savedData?.map(item => item.property_id) || [];
        }
      }

      // Format property data to match the component expectations
      const formattedProperties = propertiesData?.map(property => ({
        id: property.id,
        title: property.title,
        price: property.price,
        address: `${property.address}, ${property.city}, ${property.state}`,
        city: property.city,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        propertyType: property.property_type,
        images: property.property_images || [],
        agent: property.agent,
        daysOnMarket: Math.floor((new Date() - new Date(property.created_at)) / (1000 * 60 * 60 * 24)),
        isSaved: savedProperties.includes(property.id),
        coordinates: null // No coordinates in current schema
      })) || [];

      setProperties(formattedProperties);
      applyFilters(formattedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      applyFilters([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize properties and apply filters
  useEffect(() => {
    if (properties.length > 0) {
      applyFilters(properties);
    }
  }, [searchParams, properties, sortBy]);

  // Apply filters based on search params
  const applyFilters = (propertiesToFilter = properties) => {
    let filtered = [...propertiesToFilter];
    
    const query = searchParams?.get('query');
    const location = searchParams?.get('location');
    const propertyType = searchParams?.get('propertyType');
    const minPrice = searchParams?.get('minPrice');
    const maxPrice = searchParams?.get('maxPrice');
    const bedrooms = searchParams?.get('bedrooms');
    const bathrooms = searchParams?.get('bathrooms');

    if (query) {
      filtered = filtered?.filter(property =>
        property?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
        property?.address?.toLowerCase()?.includes(query?.toLowerCase()) ||
        property?.description?.toLowerCase()?.includes(query?.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered?.filter(property =>
        property?.address?.toLowerCase()?.includes(location?.toLowerCase())
      );
    }

    if (propertyType && propertyType !== 'all') {
      filtered = filtered?.filter(property =>
        property?.propertyType === propertyType
      );
    }

    if (minPrice) {
      filtered = filtered?.filter(property =>
        property?.price >= parseInt(minPrice)
      );
    }

    if (maxPrice) {
      filtered = filtered?.filter(property =>
        property?.price <= parseInt(maxPrice)
      );
    }

    if (bedrooms) {
      filtered = filtered?.filter(property =>
        property?.bedrooms >= parseInt(bedrooms)
      );
    }

    if (bathrooms) {
      filtered = filtered?.filter(property =>
        property?.bathrooms >= parseInt(bathrooms)
      );
    }

    // Apply sorting
    filtered = sortProperties(filtered, sortBy);
    
    setFilteredProperties(filtered);
  };

  // Sort properties
  const sortProperties = (propertiesToSort, sortOption) => {
    const sorted = [...propertiesToSort];
    
    switch (sortOption) {
      case 'price-low':
        return sorted?.sort((a, b) => a?.price - b?.price);
      case 'price-high':
        return sorted?.sort((a, b) => b?.price - a?.price);
      case 'newest':
        return sorted?.sort((a, b) => a?.daysOnMarket - b?.daysOnMarket);
      case 'oldest':
        return sorted?.sort((a, b) => b?.daysOnMarket - a?.daysOnMarket);
      case 'size':
        return sorted?.sort((a, b) => b?.sqft - a?.sqft);
      default:
        return sorted;
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const sorted = sortProperties(filteredProperties, newSortBy);
    setFilteredProperties(sorted);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(filters)?.forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
        newSearchParams?.set(key, value);
      }
    });
    
    setSearchParams(newSearchParams);
    applyFilters();
  };

  // Handle property save/unsave
  const handlePropertySave = (propertyId, isSaved) => {
    setProperties(prev => prev?.map(property =>
      property?.id === propertyId ? { ...property, isSaved } : property
    ));
    setFilteredProperties(prev => prev?.map(property =>
      property?.id === propertyId ? { ...property, isSaved } : property
    ));
  };

  // Infinite scroll observer
  const lastPropertyElementRef = useRef();
  useEffect(() => {
    if (loading) return;
    
    if (observerRef?.current) observerRef?.current?.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (lastPropertyElementRef?.current) {
      observerRef?.current?.observe(lastPropertyElementRef?.current);
    }
  }, [loading, hasMore]);

  // Get breadcrumb items
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/homepage' },
      { label: 'Properties', path: '/property-listings' }
    ];

    const location = searchParams?.get('location');
    const propertyType = searchParams?.get('propertyType');

    if (location) {
      breadcrumbs?.push({ label: location, path: null });
    }

    if (propertyType && propertyType !== 'all') {
      breadcrumbs?.push({ 
        label: propertyType?.charAt(0)?.toUpperCase() + propertyType?.slice(1), 
        path: null 
      });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 lg:pt-18">
        {/* Breadcrumb */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              {getBreadcrumbs()?.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <Icon name="ChevronRight" size={14} className="text-text-secondary" />
                  )}
                  {crumb?.path ? (
                    <Link
                      to={crumb?.path}
                      className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                    >
                      {crumb?.label}
                    </Link>
                  ) : (
                    <span className="text-text-primary font-medium">{crumb?.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Search Results Header */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Properties for Sale
                </h1>
                <p className="text-text-secondary mt-1">
                  {loading ? 'Loading...' : `${filteredProperties?.length} properties found`}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* View Toggle (Mobile) */}
                <div className="flex lg:hidden bg-secondary-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="List" size={16} className="inline mr-1" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'map' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="Map" size={16} className="inline mr-1" />
                    Map
                  </button>
                </div>

                {/* Sort Dropdown */}
                <SortDropdown value={sortBy} onChange={handleSortChange} />

                {/* Filter Toggle */}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
                >
                  <Icon name="SlidersHorizontal" size={16} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {/* Filter Panel */}
            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onFilterChange={handleFilterChange}
              initialFilters={{
                query: searchParams?.get('query') || '',
                location: searchParams?.get('location') || '',
                propertyType: searchParams?.get('propertyType') || '',
                minPrice: searchParams?.get('minPrice') || '',
                maxPrice: searchParams?.get('maxPrice') || '',
                bedrooms: searchParams?.get('bedrooms') || '',
                bathrooms: searchParams?.get('bathrooms') || ''
              }}
            />

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Desktop Split View */}
              <div className="hidden lg:flex h-[calc(100vh-200px)]">
                {/* Property List */}
                <div className="w-3/5 overflow-y-auto">
                  <div className="p-6">
                    {loading ? (
                      <div className="grid grid-cols-1 gap-6">
                        {[...Array(6)]?.map((_, index) => (
                          <div key={index} className="card p-4">
                            <div className="animate-pulse">
                              <div className="flex space-x-4">
                                <div className="w-48 h-32 bg-secondary-200 rounded-md"></div>
                                <div className="flex-1 space-y-3">
                                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                                  <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                                  <div className="flex space-x-2">
                                    <div className="h-3 bg-secondary-200 rounded w-16"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-16"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-16"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredProperties?.map((property, index) => (
                          <div
                            key={property?.id}
                            ref={index === filteredProperties?.length - 1 ? lastPropertyElementRef : null}
                            onMouseEnter={() => setSelectedProperty(property)}
                            onMouseLeave={() => setSelectedProperty(null)}
                          >
                            <PropertyCard
                              property={property}
                              variant="list"
                              onSave={handlePropertySave}
                              isHighlighted={selectedProperty?.id === property?.id}
                            />
                          </div>
                        ))}
                        
                        {filteredProperties?.length === 0 && (
                          <div className="text-center py-12">
                            <Icon name="Search" size={48} className="text-secondary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                              No properties found
                            </h3>
                            <p className="text-text-secondary">
                              Try adjusting your search criteria or filters
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map View */}
                <div className="w-2/5 border-l border-border">
                  <MapView
                    properties={filteredProperties}
                    selectedProperty={selectedProperty}
                    onPropertySelect={setSelectedProperty}
                  />
                </div>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden">
                {viewMode === 'list' ? (
                  <div className="p-4">
                    {loading ? (
                      <div className="grid grid-cols-1 gap-4">
                        {[...Array(6)]?.map((_, index) => (
                          <div key={index} className="card p-4">
                            <div className="animate-pulse">
                              <div className="w-full h-48 bg-secondary-200 rounded-md mb-4"></div>
                              <div className="space-y-3">
                                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                                <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredProperties?.map((property, index) => (
                          <div
                            key={property?.id}
                            ref={index === filteredProperties?.length - 1 ? lastPropertyElementRef : null}
                          >
                            <PropertyCard
                              property={property}
                              variant="card"
                              onSave={handlePropertySave}
                            />
                          </div>
                        ))}
                        
                        {filteredProperties?.length === 0 && (
                          <div className="text-center py-12">
                            <Icon name="Search" size={48} className="text-secondary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                              No properties found
                            </h3>
                            <p className="text-text-secondary">
                              Try adjusting your search criteria or filters
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[calc(100vh-200px)]">
                    <MapView
                      properties={filteredProperties}
                      selectedProperty={selectedProperty}
                      onPropertySelect={setSelectedProperty}
                      isMobile={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyListings;