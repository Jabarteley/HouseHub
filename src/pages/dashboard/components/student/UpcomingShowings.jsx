import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const UpcomingShowings = () => {
  const { user } = useAuth();
  const [showings, setShowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUpcomingShowings();
      setupRealTimeSubscription();
    }
    
    return () => {
      if (realtimeSubscription) {
        supabase.removeSubscription(realtimeSubscription);
      }
    };
  }, [user]);

  const fetchUpcomingShowings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('property_showings')
        .select(`
          id,
          property_id,
          student_id,
          scheduled_date,
          status,
          notes,
          properties (title)
        `)
        .eq('student_id', user.id)
        .gte('scheduled_date', new Date().toISOString()) // Only upcoming showings
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      setShowings(data || []);
    } catch (error) {
      console.error('Error fetching upcoming showings:', error);
      setShowings([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = async () => {
    try {
      const subscription = supabase
        .channel('showings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'property_showings',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // Add new showing to the list if it's upcoming
              if (new Date(payload.new.scheduled_date) >= new Date()) {
                setShowings(prev => [...prev, payload.new].sort((a, b) => 
                  new Date(a.scheduled_date) - new Date(b.scheduled_date)
                ));
              }
            } else if (payload.eventType === 'UPDATE') {
              // Update the showing in the list
              setShowings(prev => 
                prev.map(showing => 
                  showing.id === payload.new.id ? payload.new : showing
                ).sort((a, b) => 
                  new Date(a.scheduled_date) - new Date(b.scheduled_date)
                )
              );
            } else if (payload.eventType === 'DELETE') {
              // Remove the showing from the list
              setShowings(prev => prev.filter(showing => showing.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      setRealtimeSubscription(subscription);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-secondary-100 rounded-lg"></div>
          <div className="h-12 bg-secondary-100 rounded-lg"></div>
          <div className="h-12 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Upcoming Showings</h2>
      </div>
      <div className="p-6">
        {showings.length > 0 ? (
          <div className="space-y-4">
            {showings.map(showing => (
              <div key={showing.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{showing.properties?.title || 'Property'}</p>
                  <p className="text-xs text-text-secondary">{new Date(showing.scheduled_date).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showing.status)}`}>
                  {showing.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">You have no upcoming showings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingShowings;
