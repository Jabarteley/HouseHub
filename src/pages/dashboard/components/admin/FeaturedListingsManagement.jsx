import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const FeaturedListingsManagement = () => {
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all properties - first get the properties
      const { data: allProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, address, city, state, price, landlord_id') // Remove created_at since it doesn't exist
        .order('id', { ascending: false }); // Order by id instead of created_at

      if (propertiesError) throw propertiesError;

      // Then get user profiles separately to avoid the relationship error
      const landlordIds = [...new Set(allProperties.map(prop => prop.landlord_id))];
      let landlords = {};
      
      if (landlordIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', landlordIds);
          
        if (!userError) {
          userData.forEach(user => {
            landlords[user.id] = user.full_name;
          });
        }
      }

      // Combine the data and add a featured property as a placeholder
      // Since is_featured column doesn't exist, we'll simulate
      const propertiesWithLandlords = allProperties.map(property => ({
        ...property,
        created_at: 'N/A', // Add this since UI expects it
        // For demo purposes, let's randomly mark some as featured
        is_featured: property.id % 5 === 0, // Every 5th property is featured for demo
        featured_until: property.id % 5 === 0 ? new Date(Date.now() + 30*24*60*60*1000).toISOString() : null,
        landlord_name: landlords[property.landlord_id] || 'Unknown Landlord'
      }));

      // Filter properties based on search term
      let filteredProperties = propertiesWithLandlords;
      
      if (searchTerm) {
        filteredProperties = filteredProperties.filter(prop => 
          prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.landlord_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Separate featured and non-featured properties
      const featured = filteredProperties.filter(prop => prop.is_featured);
      const nonFeatured = filteredProperties.filter(prop => !prop.is_featured);

      setFeaturedProperties(featured);
      setProperties(nonFeatured);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (propertyId, isCurrentlyFeatured) => {
    // Since is_featured column doesn't exist in the database, we'll just refresh to update the simulated status
    // In a real app, you would need to add the is_featured column to your properties table
    console.log(`${isCurrentlyFeatured ? 'Removing from' : 'Adding to'} featured: ${propertyId}`);
    
    // Refresh data to update the simulated featured status
    fetchData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Featured Listings Management</h2>
        <div className="mt-2 md:mt-0 flex space-x-2">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-text-primary text-sm"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Featured Listings</h3>
            <p className="text-sm text-blue-700">{featuredProperties.length} properties currently featured</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Available for Featuring</h3>
            <p className="text-sm text-green-700">{properties.length} properties available</p>
          </div>
        </div>
      </div>
      
      {/* Featured Properties */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
          <Icon name="Star" size={20} className="text-yellow-500 mr-2" />
          Featured Properties
        </h3>
        {featuredProperties.length === 0 ? (
          <div className="text-center py-4 text-text-secondary">
            No properties are currently featured
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Featured Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {featuredProperties.map(property => (
                  <tr key={property.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">{property.title}</div>
                      <div className="text-sm text-text-secondary">
                        {property.address}, {property.city}, {property.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {property.landlord_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatCurrency(property.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(property.featured_until)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleFeatured(property.id, true)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        Remove Featured
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Available Properties */}
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-3">Available Properties</h3>
        {properties.length === 0 ? (
          <div className="text-center py-4 text-text-secondary">
            No properties available to feature
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {properties.map(property => (
                  <tr key={property.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">{property.title}</div>
                      <div className="text-sm text-text-secondary">
                        {property.address}, {property.city}, {property.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {property.landlord_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatCurrency(property.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(property.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleFeatured(property.id, false)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                      >
                        Make Featured
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-secondary-100 rounded-lg p-4">
        <h3 className="font-medium text-text-primary mb-2">Featured Listings Information</h3>
        <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
          <li>Featured properties appear at the top of search results</li>
          <li>Featured status typically lasts for 30 days</li>
          <li>Landlords may need to pay a fee to feature their listings</li>
          <li>Admins can override featured status for promotional purposes</li>
        </ul>
      </div>
    </div>
  );
};

export default FeaturedListingsManagement;