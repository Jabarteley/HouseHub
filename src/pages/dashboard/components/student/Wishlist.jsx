import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';

const Wishlist = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
      setupRealTimeSubscription();
    }
    
    return () => {
      if (realtimeSubscription) {
        supabase.removeSubscription(realtimeSubscription);
      }
    };
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('property_wishlist') // Assuming a wishlist table exists
        .select(`
          id,
          property_id,
          created_at,
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
            area_sqft,
            agent_status,
            property_images (image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected format
      const wishlistProperties = data.map(item => ({
        ...item.properties,
        wishlist_id: item.id,
        added_to_wishlist: item.created_at
      }));

      setProperties(wishlistProperties || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.code === 'PGRST205') {
        console.warn('Property wishlist table not found. Please run the migration to create the required tables.');
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = async () => {
    try {
      const subscription = supabase
        .channel('wishlist-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'property_wishlist',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // Add new wishlist item to the top of the list
              const newWishlistItem = {
                ...payload.new.properties,
                wishlist_id: payload.new.id,
                added_to_wishlist: payload.new.created_at
              };
              setProperties(prev => [newWishlistItem, ...prev]);
            } else if (payload.eventType === 'DELETE') {
              // Remove the wishlist item from the list
              setProperties(prev => prev.filter(prop => prop.wishlist_id !== payload.old.id));
            }
          }
        )
        .subscribe();

      setRealtimeSubscription(subscription);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  const removeFromWishlist = async (propertyId, wishlistId) => {
    try {
      const { error } = await supabase
        .from('property_wishlist')
        .delete()
        .eq('id', wishlistId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Wishlist</h2>
      </div>
      <div className="p-6">
        {properties.length > 0 ? (
          <div className="space-y-4">
            {properties.map(property => {
              const primaryImage = property.property_images?.find(img => img.is_primary) || property.property_images?.[0];
              return (
                <div key={property.id} className="border border-border rounded-lg p-4 flex">
                  <div className="w-24 h-24 flex-shrink-0 mr-4">
                    <Image
                      src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'}
                      alt={property.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-text-primary">{property.title}</h3>
                      <button
                        onClick={() => removeFromWishlist(property.id, property.wishlist_id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove from wishlist"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-text-secondary">{property.address}, {property.city}, {property.state}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-text-secondary">
                      <span className="font-semibold text-text-primary">{formatPrice(property.price)}</span>
                      <span>{property.bedrooms} bd</span>
                      <span>{property.bathrooms} ba</span>
                      <span>{property.area_sqft} sqft</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 text-text-secondary">
                        {property.property_type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Heart" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">Your wishlist is empty</p>
            <p className="text-sm text-text-tertiary mt-2">
              Start browsing properties and add them to your wishlist to save them for later
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;