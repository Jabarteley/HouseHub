import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const SearchInterface = ({ variant = 'hero', onSearch, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.query || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || '');
  const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || '');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const filtersRef = useRef(null);
  const locationRef = useRef(null);

  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '0-200000', label: 'Under $200K' },
    { value: '200000-400000', label: '$200K - $400K' },
    { value: '400000-600000', label: '$400K - $600K' },
    { value: '600000-800000', label: '$600K - $800K' },
    { value: '800000-1000000', label: '$800K - $1M' },
    { value: '1000000+', label: 'Over $1M' }
  ];

  const locationSuggestions = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef?.current && !filtersRef?.current?.contains(event?.target)) {
        setIsFiltersOpen(false);
      }
      if (locationRef?.current && !locationRef?.current?.contains(event?.target)) {
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const searchParams = {
      query: searchQuery,
      location,
      propertyType,
      priceRange
    };
    
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Default navigation to property listings
      const params = new URLSearchParams();
      Object.entries(searchParams)?.forEach(([key, value]) => {
        if (value) params?.append(key, value);
      });
      window.location.href = `/property-listings?${params?.toString()}`;
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setIsLocationDropdownOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setPropertyType('');
    setPriceRange('');
  };

  const hasActiveFilters = searchQuery || location || propertyType || priceRange;

  if (variant === 'hero') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="Search" size={24} className="text-secondary" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              placeholder="Search by neighborhood, city, or property features..."
              className="block w-full pl-12 pr-4 py-4 text-lg border border-border rounded-lg 
                       focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                       transition-all duration-200 ease-out bg-surface text-text-primary
                       placeholder-text-secondary shadow-elevation-1"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Location Filter */}
            <div className="relative" ref={locationRef}>
              <button
                type="button"
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border 
                         rounded-md hover:bg-secondary-100 transition-all duration-200 ease-out
                         micro-interaction"
              >
                <Icon name="MapPin" size={16} />
                <span className="text-sm font-medium">
                  {location || 'Location'}
                </span>
                <Icon 
                  name="ChevronDown" 
                  size={16} 
                  className={`transition-transform duration-200 ${
                    isLocationDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute top-full mt-1 w-64 bg-surface rounded-md shadow-elevation-3 
                              border border-border z-dropdown">
                  <div className="p-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e?.target?.value)}
                      placeholder="Enter city or zip code..."
                      className="w-full px-3 py-2 border border-border rounded-md text-sm
                               focus:border-border-focus focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {locationSuggestions?.filter(suggestion => 
                        suggestion?.toLowerCase()?.includes(location?.toLowerCase())
                      )?.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-100 transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Type Filter */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e?.target?.value)}
              className="px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium
                       focus:border-border-focus focus:ring-1 focus:ring-primary-500 
                       transition-all duration-200 ease-out"
            >
              {propertyTypes?.map((type) => (
                <option key={type?.value} value={type?.value}>
                  {type?.label}
                </option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e?.target?.value)}
              className="px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium
                       focus:border-border-focus focus:ring-1 focus:ring-primary-500 
                       transition-all duration-200 ease-out"
            >
              {priceRanges?.map((range) => (
                <option key={range?.value} value={range?.value}>
                  {range?.label}
                </option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border 
                       rounded-md hover:bg-secondary-100 transition-all duration-200 ease-out
                       micro-interaction"
            >
              <Icon name="SlidersHorizontal" size={16} />
              <span className="text-sm font-medium">More Filters</span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <Icon name="X" size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {isFiltersOpen && (
            <div 
              ref={filtersRef}
              className="bg-surface border border-border rounded-lg p-6 shadow-elevation-2
                       progressive-disclosure"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Bedrooms
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-1 focus:ring-primary-500">
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Bathrooms
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-1 focus:ring-primary-500">
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Square Feet
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-1 focus:ring-primary-500">
                    <option value="">Any Size</option>
                    <option value="0-1000">Under 1,000</option>
                    <option value="1000-2000">1,000 - 2,000</option>
                    <option value="2000-3000">2,000 - 3,000</option>
                    <option value="3000+">Over 3,000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold
                       hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                       transition-all duration-200 ease-out micro-interaction shadow-elevation-2"
            >
              Search Properties
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Compact variant for header
  return (
    <form onSubmit={handleSearch} className="flex items-center space-x-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="Search" size={16} className="text-secondary" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          placeholder="Search properties..."
          className="block w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm
                   focus:border-border-focus focus:ring-1 focus:ring-primary-500 
                   transition-all duration-200 ease-out bg-surface text-text-primary
                   placeholder-text-secondary"
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium
                 hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
      >
        Search
      </button>
    </form>
  );
};

export default SearchInterface;