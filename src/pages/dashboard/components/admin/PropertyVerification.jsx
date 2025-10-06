import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const PropertyVerification = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState(null);
  const [updatedProperty, setUpdatedProperty] = useState({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // First fetch properties - remove created_at since it doesn't exist
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, address, city, state, price, bedrooms, bathrooms, area_sqft, property_type, description, status, landlord_id')
        .order('id', { ascending: false }); // Order by id instead of created_at

      if (propertiesError) throw propertiesError;

      // Then fetch user profiles separately to avoid the relationship error
      const landlordIds = [...new Set(propertiesData.map(prop => prop.landlord_id))];
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

      // Combine the data
      const propertiesWithLandlords = propertiesData.map(property => ({
        ...property,
        created_at: 'N/A', // Add this since UI expects it
        landlord_name: landlords[property.landlord_id] || 'Unknown Landlord'
      }));

      setProperties(propertiesWithLandlords || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (property) => {
    setEditingProperty(property.id);
    setUpdatedProperty({
      title: property.title,
      address: property.address,
      city: property.city,
      state: property.state,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area_sqft: property.area_sqft,
      property_type: property.property_type,
      description: property.description,
    });
  };

  const handleSaveEdit = async (propertyId) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ ...updatedProperty })
        .eq('id', propertyId);

      if (error) throw error;

      setEditingProperty(null);
      fetchProperties(); // Refresh the list
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProperty(null);
    setUpdatedProperty({});
  };

  const handleRemoveProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to remove this property? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      fetchProperties(); // Refresh the list
    } catch (error) {
      console.error('Error removing property:', error);
    }
  };

  const handleVerificationToggle = async (propertyId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'verified' ? 'active' : 'verified';
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId);

      if (error) throw error;

      fetchProperties(); // Refresh the list
    } catch (error) {
      console.error('Error updating property verification:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-secondary-100 rounded-lg"></div>
          <div className="h-20 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Property Verification</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Landlord</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
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
                  {property.landlord_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatCurrency(property.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {property.bedrooms} bd | {property.bathrooms} ba | {property.area_sqft} sqft
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${property.status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : property.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {editingProperty === property.id ? (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleSaveEdit(property.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(property)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleVerificationToggle(property.id, property.status)}
                        className={`px-3 py-1 rounded text-xs ${
                          property.status === 'verified' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {property.status === 'verified' ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleRemoveProperty(property.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Property editing form when in edit mode */}
      {editingProperty && (
        <div className="mt-6 p-4 bg-secondary-100 rounded-lg">
          <h3 className="font-medium text-text-primary mb-3">Editing Property</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
              <input
                type="text"
                value={updatedProperty.title || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, title: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
              <input
                type="text"
                value={updatedProperty.address || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, address: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">City</label>
              <input
                type="text"
                value={updatedProperty.city || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, city: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">State</label>
              <input
                type="text"
                value={updatedProperty.state || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, state: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Price</label>
              <input
                type="number"
                value={updatedProperty.price || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bedrooms</label>
              <input
                type="number"
                value={updatedProperty.bedrooms || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, bedrooms: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bathrooms</label>
              <input
                type="number"
                value={updatedProperty.bathrooms || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, bathrooms: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Area (sqft)</label>
              <input
                type="number"
                value={updatedProperty.area_sqft || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, area_sqft: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Property Type</label>
              <select
                value={updatedProperty.property_type || ''}
                onChange={(e) => setUpdatedProperty({...updatedProperty, property_type: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={updatedProperty.description || ''}
              onChange={(e) => setUpdatedProperty({...updatedProperty, description: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary h-24"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyVerification;