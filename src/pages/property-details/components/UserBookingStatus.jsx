import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';

const UserBookingStatus = ({ propertyId, unitId = null }) => {
  const { user } = useAuth();
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && propertyId) {
      fetchUserBookingStatus();
    }
  }, [user, propertyId, unitId]);

  const fetchUserBookingStatus = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('bookings')
        .select(`
          id,
          status,
          unit_id,
          units!inner (unit_name),
          booking_date,
          start_date,
          duration,
          message
        `)
        .eq('client_id', user.id);

      if (unitId) {
        query = query.eq('unit_id', unitId);
      } else {
        query = query.eq('units.property_id', propertyId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setBookingStatus(data[0]);
      } else {
        setBookingStatus(null);
      }
    } catch (error) {
      console.error('Error fetching booking status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!bookingStatus) {
    return null; // No booking status to show
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-success-600 bg-success-100';
      case 'Pending':
        return 'text-warning-600 bg-warning-100';
      case 'Rejected':
        return 'text-error-600 bg-error-100';
      case 'Cancelled':
        return 'text-text-secondary bg-secondary-100';
      case 'Completed':
        return 'text-primary bg-primary-100';
      default:
        return 'text-text-secondary bg-secondary-100';
    }
  };

  return (
    <div className="mb-4 p-4 bg-secondary-50 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-text-primary flex items-center">
          <Icon name="CalendarCheck" size={16} className="mr-2" />
          Your Booking Status
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bookingStatus.status)}`}>
          {bookingStatus.status}
        </span>
      </div>
      
      <div className="text-sm text-text-secondary">
        <p className="mb-1"><span className="font-medium">Unit:</span> {bookingStatus.units?.unit_name}</p>
        <p className="mb-1"><span className="font-medium">Requested on:</span> {new Date(bookingStatus.booking_date).toLocaleDateString()}</p>
        {bookingStatus.start_date && (
          <p className="mb-1"><span className="font-medium">Move-in date:</span> {new Date(bookingStatus.start_date).toLocaleDateString()}</p>
        )}
        {bookingStatus.duration && (
          <p className="mb-1"><span className="font-medium">Duration:</span> {bookingStatus.duration} months</p>
        )}
        {bookingStatus.message && (
          <p className="text-xs text-text-tertiary mt-2 italic">Message: {bookingStatus.message}</p>
        )}
      </div>
    </div>
  );
};

export default UserBookingStatus;