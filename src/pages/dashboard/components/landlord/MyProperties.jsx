// src/pages/dashboard/components/landlord/MyProperties.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import InviteAgent from './InviteAgent'; // Import the component we just created

const MyProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteAgent, setShowInviteAgent] = useState(null); // Track which property's invite modal is open

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
          property_type,
          bedrooms,
          bathrooms,
          area_sqft,
          created_at,
          agent:user_profiles!properties_agent_id_fkey(full_name),
          property_images(image_url, is_primary)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
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

  const getPropertyStatusColor = (status) => {
    const statusMap = {
      'active': 'bg-success-100 text-success',
      'draft': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-warning-100 text-warning',
      'under contract': 'bg-primary-100 text-primary',
      'sold': 'bg-secondary-100 text-secondary-600',
      'rented': 'bg-purple-100 text-purple-600',
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">My Properties</h2>
          <Link 
            to="/create-listing" 
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Add Property
          </Link>
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="divide-y divide-border">
          {properties.map((property) => {
            const primaryImage = property.property_images?.find(img => img.is_primary);
            
            return (
              <div key={property.id} className="p-6 hover:bg-secondary-100 transition-colors">
                <div className="flex items-start space-x-4">
                  <img 
                    src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'} 
                    alt={property.title} 
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-text-primary truncate">{property.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPropertyStatusColor(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-text-secondary truncate">{property.address}, {property.city}, {property.state}</p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-text-secondary">
                      <span>{formatPrice(property.price)}</span>
                      <span>{property.bedrooms} bd</span>
                      <span>{property.bathrooms} ba</span>
                      <span>{property.area_sqft} sqft</span>
                    </div>
                    
                    {property.agent && (
                      <div className="mt-2 text-sm">
                        <span className="text-text-secondary">Assigned Agent: </span>
                        <span className="font-medium text-text-primary">{property.agent.full_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowInviteAgent(showInviteAgent === property.id ? null : property.id)}
                      className="px-3 py-1 bg-secondary-100 text-text-secondary rounded-md text-sm font-medium hover:bg-secondary-200"
                    >
                      {showInviteAgent === property.id ? 'Close' : 'Invite Agent'}
                    </button>
                    <Link 
                      to={`/edit-listing/${property.id}`} 
                      className="px-3 py-1 bg-secondary-100 text-text-secondary rounded-md text-sm font-medium hover:bg-secondary-200"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
                
                {/* Invite Agent Modal */}
                {showInviteAgent === property.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <InviteAgent propertyId={property.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No properties listed</h3>
          <p className="text-text-secondary mb-4">Start by adding your first property to the platform</p>
          <Link 
            to="/create-listing" 
            className="inline-block px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Add Property
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyProperties;