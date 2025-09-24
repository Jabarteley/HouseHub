import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';

import PropertyCard from './components/PropertyCard';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import SortDropdown from './components/SortDropdown';

const PropertyListings = () => {
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

  // Mock property data with updated images
  const mockProperties = [
    {
      id: 1,
      title: "Modern Downtown Apartment",
      price: 450000,
      address: "123 Main Street, Downtown, NY 10001",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      propertyType: "apartment",
      images: [
        "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
      ],
      agent: {
        name: "Sarah Johnson",
        phone: "(555) 123-4567",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      coordinates: { lat: 40.7128, lng: -74.0060 },
      isSaved: false,
      daysOnMarket: 15,
      amenities: ["Gym", "Pool", "Parking", "Pet Friendly"],
      description: `Beautiful modern apartment in the heart of downtown with stunning city views and premium amenities. This spacious 2-bedroom, 2-bathroom unit features floor-to-ceiling windows, hardwood floors, and a gourmet kitchen with stainless steel appliances.

The building offers world-class amenities including a fitness center, rooftop pool, and 24-hour concierge service. Located within walking distance of restaurants, shopping, and public transportation.`
    },
    {
      id: 2,
      title: "Luxury Suburban House",
      price: 750000,
      address: "456 Oak Avenue, Westfield, NJ 07090",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      propertyType: "house",
      images: [
        "https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg",
        "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
      ],
      agent: {
        name: "Michael Chen",
        phone: "(555) 987-6543",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg"
      },
      coordinates: { lat: 40.6501, lng: -74.3496 },
      isSaved: true,
      daysOnMarket: 8,
      amenities: ["Garage", "Garden", "Fireplace", "Basement"],
      description: `Stunning 4-bedroom colonial home in prestigious Westfield neighborhood. This meticulously maintained property features an open floor plan, gourmet kitchen with granite countertops, and a master suite with walk-in closet.

The beautifully landscaped yard includes a deck perfect for entertaining and a two-car garage. Located in top-rated school district with easy access to NYC transportation.`
    },
    {
      id: 3,
      title: "Cozy Studio Loft",
      price: 280000,
      address: "789 Industrial Blvd, Brooklyn, NY 11201",
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      propertyType: "loft",
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
      ],
      agent: {
        name: "Emily Rodriguez",
        phone: "(555) 456-7890",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg"
      },
      coordinates: { lat: 40.6892, lng: -73.9442 },
      isSaved: false,
      daysOnMarket: 22,
      amenities: ["Exposed Brick", "High Ceilings", "Hardwood Floors"],
      description: `Charming studio loft in trendy Brooklyn neighborhood featuring exposed brick walls, soaring ceilings, and original hardwood floors. This unique space offers an open layout perfect for modern living.

Located in a converted warehouse building with easy access to Manhattan via subway. The area is known for its vibrant arts scene, cafes, and restaurants.`
    },
    {
      id: 4,
      title: "Waterfront Condo",
      price: 920000,
      address: "321 Harbor View, Jersey City, NJ 07302",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      propertyType: "condo",
      images: [
        "https://images.pixabay.com/photo/2016/11/22/23/38/apartment-1851201_1280.jpg",
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
      ],
      agent: {
        name: "David Park",
        phone: "(555) 321-0987",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg"
      },
      coordinates: { lat: 40.7178, lng: -74.0431 },
      isSaved: false,
      daysOnMarket: 5,
      amenities: ["Water View", "Balcony", "Concierge", "Gym"],
      description: `Spectacular waterfront condo with breathtaking Manhattan skyline views. This luxury 3-bedroom unit features floor-to-ceiling windows, premium finishes, and a private balcony overlooking the Hudson River.

Building amenities include 24-hour doorman, fitness center, and rooftop deck. Prime location with ferry service to Manhattan and PATH train access.`
    },
    {
      id: 5,
      title: "Historic Townhouse",
      price: 1200000,
      address: "567 Brownstone Row, Brooklyn, NY 11215",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3200,
      propertyType: "townhouse",
      images: [
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
        "https://images.pixabay.com/photo/2017/03/22/17/39/kitchen-2165756_1280.jpg"
      ],
      agent: {
        name: "Lisa Thompson",
        phone: "(555) 654-3210",
        avatar: "https://randomuser.me/api/portraits/women/42.jpg"
      },
      coordinates: { lat: 40.6782, lng: -73.9442 },
      isSaved: true,
      daysOnMarket: 12,
      amenities: ["Historic Details", "Private Garden", "Parking", "Renovated"],
      description: `Beautifully restored 19th-century brownstone townhouse in Park Slope. This elegant 4-bedroom home combines historic charm with modern amenities, featuring original moldings, hardwood floors, and updated kitchen and baths.

The property includes a private garden, finished basement, and parking space. Located on a tree-lined street near Prospect Park and excellent restaurants.`
    },
    {
      id: 6,
      title: "Modern Penthouse",
      price: 1850000,
      address: "890 Sky Tower, Manhattan, NY 10019",
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2200,
      propertyType: "penthouse",
      images: [
        "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "https://images.pixabay.com/photo/2016/12/30/07/59/kitchen-1940174_1280.jpg"
      ],
      agent: {
        name: "Robert Kim",
        phone: "(555) 789-0123",
        avatar: "https://randomuser.me/api/portraits/men/38.jpg"
      },
      coordinates: { lat: 40.7589, lng: -73.9851 },
      isSaved: false,
      daysOnMarket: 3,
      amenities: ["Terrace", "City Views", "Luxury Finishes", "Doorman"],
      description: `Extraordinary penthouse with panoramic city views and private terrace. This sophisticated 3-bedroom residence features the finest finishes, custom millwork, and a gourmet kitchen with top-of-the-line appliances.

The wraparound terrace offers stunning views of Central Park and the Manhattan skyline. Building amenities include full-service concierge, fitness center, and valet parking.`
    }
  ];

  // Initialize properties and apply filters
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProperties(mockProperties);
      applyFilters(mockProperties);
      setLoading(false);
    }, 1000);
  }, []);

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