import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const RecentlyViewed = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
      setupRealTimeSubscription();
    }
    
    return () => {
      if (realtimeSubscription) {
        supabase.removeSubscription(realtimeSubscription);
      }
    };
  }, [user]);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('property_views') // Using the table that's referenced in StudentDashboard
        .select(`
          id,
          property_id,
          viewed_at,
          properties (
            id,
            title,
            address,
            city,
            state,
            price,
            property_type,
            bedrooms,
            bathrooms,
            property_images (image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform data to match expected format
      const viewedProperties = data.map(item => ({
        ...item.properties,
        viewed_at: item.viewed_at
      }));

      setProperties(viewedProperties || []);
    } catch (error) {
      console.error('Error fetching recently viewed properties:', error);
      if (error.code === 'PGRST205') {
        console.warn('Property views table not found. Please run the migration to create the required tables.');
        setProperties([]);
      } else {
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = async () => {
    try {
      const subscription = supabase
        .channel('property-views-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'property_views',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Add new viewed property to the top of the list
            const newViewedProperty = {
              ...payload.new.properties,
              viewed_at: payload.new.viewed_at
            };
            setProperties(prev => [newViewedProperty, ...prev.slice(0, 4)]);
          }
        )
        .subscribe();

      setRealtimeSubscription(subscription);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
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
        <h2 className="text-lg font-semibold text-text-primary">Recently Viewed</h2>
      </div>
      <div className="p-6">
        {properties.length > 0 ? (
          <div className="space-y-4">
            {properties.map(property => {
              const primaryImage = property.property_images?.find(img => img.is_primary) || property.property_images?.[0];
              return (
                <div key={property.id} className="flex items-center p-3 border border-border rounded-lg">
                  <div className="w-16 h-16 flex-shrink-0 mr-4">
                    <img 
                      src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'} 
                      alt={property.title}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/assets/Images/no_image.jpeg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{property.title}</h3>
                    <p className="text-sm text-text-secondary truncate">{property.address}</p>
                    <div className="mt-1 flex items-center text-sm text-text-secondary">
                      <span className="font-semibold text-text-primary">{formatPrice(property.price)}</span>
                      <span className="mx-2">•</span>
                      <span>{property.bedrooms} bd</span>
                      <span className="mx-2">•</span>
                      <span>{property.bathrooms} ba</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Eye" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No recently viewed properties.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;