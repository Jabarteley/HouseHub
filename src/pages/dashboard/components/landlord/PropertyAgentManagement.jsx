// src/pages/dashboard/components/landlord/PropertyAgentManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';
import InviteAgent from './InviteAgent';
import AgentRequests from './AgentRequests';

const PropertyAgentManagement = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

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
          status,
          agent_status,
          allow_agents,
          agent:user_profiles!properties_agent_id_fkey(full_name, avatar_url)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
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

  const getAgentStatusColor = (status) => {
    const statusMap = {
      'unassigned': 'bg-gray-100 text-gray-800',
      'requested': 'bg-warning-100 text-warning',
      'assigned': 'bg-success-100 text-success', 
      'rejected': 'bg-error-100 text-error',
      'exclusive': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-6"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-100 rounded w-3/4"></div>
                <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Property Agent Management</h3>
        <p className="text-sm text-text-secondary mt-1">Manage agents for your properties</p>
      </div>

      <div className="p-6">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="border border-border rounded-lg p-4 hover:bg-secondary-100 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-text-primary truncate">{property.title}</h4>
                    <p className="text-sm text-text-secondary truncate">{property.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAgentStatusColor(property.agent_status)}`}>
                    {property.agent_status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-lg font-semibold text-text-primary">{formatPrice(property.price)}</div>
                  <div className="text-sm text-text-secondary">{property.city}, {property.state}</div>
                </div>

                {property.agent && (
                  <div className="mb-3 p-2 bg-secondary-100 rounded-md">
                    <div className="text-sm font-medium text-text-primary">Assigned Agent</div>
                    <div className="text-sm text-text-secondary">{property.agent.full_name}</div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  {property.agent_status === 'unassigned' && (
                    <div 
                      className="cursor-pointer text-sm text-primary hover:underline"
                      onClick={() => setSelectedProperty(selectedProperty === property.id ? null : property.id)}
                    >
                      {selectedProperty === property.id ? 'Hide Invitation Form' : 'Invite Agent'}
                    </div>
                  )}
                  
                  {(property.agent_status === 'requested' || property.agent_status === 'assigned') && (
                    <div className="text-sm text-text-secondary">
                      {property.agent_status === 'requested' ? 'Request pending' : 'Agent assigned'}
                    </div>
                  )}
                  
                  {property.agent_status === 'unassigned' && property.allow_agents && (
                    <div className="text-xs text-text-tertiary">
                      Agents can discover this property
                    </div>
                  )}
                </div>

                {/* Invite Agent Form - only show if selected */}
                {selectedProperty === property.id && property.agent_status === 'unassigned' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <InviteAgent propertyId={property.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No properties added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyAgentManagement;