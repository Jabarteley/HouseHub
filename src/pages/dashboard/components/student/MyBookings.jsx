import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';
import LoadingState from '../../../property-details/components/LoadingState';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected, cancelled

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, activeTab]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('bookings')
        .select(`
          id,
          status,
          booking_date,
          start_date,
          duration,
          amount,
          message,
          created_at,
          units!inner (
            id,
            unit_name,
            price,
            property_id,
            properties!inner (
              id,
              title,
              address,
              city,
              state
            )
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filter based on active tab
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-text-primary">My Unit Bookings</h2>
        
        <div className="flex space-x-2 mt-2 sm:mt-0 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'all' && bookings.length > 0 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                  {bookings.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Calendar" size={48} className="text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Bookings Found</h3>
          <p className="text-text-secondary mb-4">
            You don't have any unit booking requests yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-6 border border-border">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {booking.units?.unit_name} - {booking.units?.properties?.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <p className="text-text-secondary text-sm mb-3">
                    {booking.units?.properties?.address}, {booking.units?.properties?.city}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Booked On</p>
                      <p className="font-medium">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Start Date</p>
                      <p className="font-medium">
                        {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Duration</p>
                      <p className="font-medium">
                        {booking.duration ? `${booking.duration} months` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Amount</p>
                      <p className="font-medium">
                        {formatPrice(booking.amount || booking.units?.price)}
                      </p>
                    </div>
                  </div>
                  
                  {booking.message && (
                    <div className="mt-3 p-2 bg-secondary-50 rounded text-sm">
                      <p className="text-text-secondary">Message: {booking.message}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <button className="px-3 py-1.5 bg-secondary-100 text-text-secondary rounded-md text-sm hover:bg-secondary-200">
                    View Details
                  </button>
                  {booking.status === 'Pending' && (
                    <button className="px-3 py-1.5 bg-error-100 text-error-600 rounded-md text-sm hover:bg-error-200">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;