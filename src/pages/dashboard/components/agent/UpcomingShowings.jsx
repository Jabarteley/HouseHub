import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const UpcomingShowings = () => {
  const { user } = useAuth();
  const [showings, setShowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchShowings();
    }
  }, [user, selectedDate]);

  const fetchShowings = async () => {
    try {
      setLoading(true);

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('property_showings')
        .select(`
          id, scheduled_date, status, notes,
          property:properties(title, address),
          client:user_profiles!student_id(full_name)
        `)
        .eq('agent_id', user.id)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      setShowings(data || []);
    } catch (error) {
      console.error('Error fetching showings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (showingId, status) => {
    try {
      const { error } = await supabase
        .from('property_showings')
        .update({ status })
        .eq('id', showingId);

      if (error) throw error;
      fetchShowings(); // Refresh
    } catch (error) {
      console.error('Error updating showing status:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'confirmed': 'bg-success-100 text-success',
      'scheduled': 'bg-blue-100 text-blue-600',
      'pending': 'bg-warning-100 text-warning',
      'cancelled': 'bg-error-100 text-error',
      'completed': 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Upcoming Showings</h3>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4 p-3 bg-secondary-100 rounded-md">
          <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))} className="text-text-secondary hover:text-text-primary">
            <Icon name="ChevronLeft" size={20} />
          </button>
          <span className="text-sm font-medium text-text-primary">{formatDate(selectedDate)}</span>
          <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))} className="text-text-secondary hover:text-text-primary">
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
        
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-24 bg-secondary-100 rounded-lg"></div>
            <div className="h-24 bg-secondary-100 rounded-lg"></div>
          </div>
        ) : showings.length > 0 ? (
          <div className="space-y-3">
            {showings.map((showing) => (
              <div key={showing.id} className="p-4 rounded-lg border border-border bg-background">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-text-primary">{formatTime(showing.scheduled_date)}</span>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(showing.status)}`}>{showing.status}</span>
                    </div>
                    <h4 className="font-medium text-text-primary text-sm mb-1">{showing.property.title}</h4>
                    <div className="flex items-center space-x-1 text-text-secondary">
                      <Icon name="User" size={12} />
                      <span className="text-xs">{showing.client.full_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {showing.status === 'scheduled' && (
                      <button onClick={() => handleUpdateStatus(showing.id, 'confirmed')} className="text-success" title="Confirm"><Icon name="Check" size={16} /></button>
                    )}
                    <button onClick={() => handleUpdateStatus(showing.id, 'cancelled')} className="text-error" title="Cancel"><Icon name="X" size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto text-secondary-300 mb-3" />
            <p className="text-text-secondary">No showings scheduled for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingShowings;