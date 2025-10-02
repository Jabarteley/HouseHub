import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const AssignedProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignedProperties();
    }
  }, [user]);

  const fetchAssignedProperties = async () => {
    try {
      setLoading(true);
      
      // Get properties where the agent is assigned
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          address,
          city,
          state,
          price,
          status,
          created_at,
          landlord_id,
          user_profiles!properties_landlord_id_fkey (full_name)
        `)
        .eq('agent_id', user.id) // Properties specifically assigned to this agent
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching assigned properties:', error);
      // Check if it's a table not found error
      if (error.code === 'PGRST205') {
        console.warn('Properties table not found. Please run the migration to create the required tables.');
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
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
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Assigned Properties</h2>
      </div>
      <div className="p-6">
        {properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-secondary-100">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{property.title}</div>
                      <div className="text-sm text-text-secondary">{property.address}, {property.city}, {property.state}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                      {property.user_profiles?.full_name || 'Unknown Owner'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === 'active' ? 'bg-green-100 text-green-800' :
                        property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        property.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        property.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                        property.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No assigned properties</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedProperties;