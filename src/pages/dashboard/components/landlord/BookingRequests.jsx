import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const BookingRequests = () => {
  const { user } = useAuth();
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      
      // Get all properties owned by the current landlord
      const { data: properties, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', user.id);

      if (propertyError) throw propertyError;

      if (properties.length > 0) {
        // Get booking requests for those properties
      const propertyIds = properties.map(p => p.id);
      const { data: requests, error: bookingError } = await supabase
        .from('property_showings')
        .select(`
          *,
          properties (title),
          student:user_profiles!property_showings_student_id_fkey (full_name)
        `)
        .in('property_id', propertyIds)
        .order('scheduled_date', { ascending: true });

      if (bookingError) {
        if (bookingError.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Property showings table not found. Please run the migration to create the required tables.');
          setBookingRequests([]);
        } else {
          throw bookingError;
        }
      } else {
        setBookingRequests(requests || []);
      }
      } else {
        setBookingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('property_showings')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh the list
      fetchBookingRequests();
    } catch (error) {
      console.error('Error updating booking request status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/4 mb-4"></div>
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
        <h2 className="text-lg font-semibold text-text-primary">Booking Requests</h2>
      </div>
      <div className="p-6">
        {bookingRequests.length > 0 ? (
          <div className="space-y-4">
            {bookingRequests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 mb-3 md:mb-0">
                    <h3 className="font-medium text-text-primary">{request.properties?.title}</h3>
                    <p className="text-sm text-text-secondary">
                      {request.student?.full_name || 'Unknown Student'}
                    </p>
                    <p className="text-sm text-text-secondary">Scheduled: {formatDate(request.scheduled_date)}</p>
                    {request.notes && (
                      <p className="text-sm text-text-secondary mt-1">Notes: {request.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      className="text-xs border border-border rounded px-2 py-1 bg-background"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No booking requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRequests;