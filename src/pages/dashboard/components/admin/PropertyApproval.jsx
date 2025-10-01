import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const PropertyApproval = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      
      // Fetch properties and user profiles separately to avoid relationship conflicts
      const { data: simpleData, error: simpleError } = await supabase
        .from('properties')
        .select('id, title, address, city, state, price, landlord_id')
        .eq('status', 'draft');
      
      if (simpleError) throw simpleError;
      
      // Then fetch user profiles separately and combine them
      const userIds = [...new Set(simpleData.map(p => p.landlord_id))];
      let userProfiles = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (!profileError) {
          userProfiles = profiles || [];
        }
      }
      
      const propertiesWithUsers = simpleData.map(property => ({
        ...property,
        user_profiles: userProfiles.find(up => up.id === property.landlord_id)
      }));
      
      setProperties(propertiesWithUsers);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (propertyId, newStatus) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId);

      if (error) throw error;

      // Refresh the list
      fetchPendingProperties();
    } catch (error) {
      console.error(`Error updating property status to ${newStatus}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-secondary-100 rounded-lg"></div>
          <div className="h-24 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Property Approval Queue</h2>
      {properties.length > 0 ? (
        <div className="space-y-4">
          {properties.map(property => (
            <div key={property.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">{property.title}</h3>
                <p className="text-sm text-text-secondary">
                  {property.address}, {property.city}, {property.state}
                </p>
                <p className="text-sm text-text-secondary">
                  Submitted by: {property.user_profiles?.full_name || 'Unknown User'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleApproval(property.id, 'rejected')}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleApproval(property.id, 'active')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-text-primary">All caught up!</h3>
          <p className="text-text-secondary">There are no properties pending approval.</p>
        </div>
      )}
    </div>
  );
};

export default PropertyApproval;
