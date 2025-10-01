import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const CalendarViewings = () => {
  const { user } = useAuth();
  const [showings, setShowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchShowings();
    }
  }, [user, currentDate]);

  const fetchShowings = async () => {
    try {
      setLoading(true);
      
      // Get showings for properties managed by this agent in the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('property_showings')
        .select(`
          id,
          property_id,
          student_id,
          agent_id,
          scheduled_date,
          status,
          notes,
          properties!property_showings_property_id_fkey (title, address),
          user_profiles!property_showings_student_id_fkey (full_name)
        `)
        .eq('agent_id', user.id)
        .gte('scheduled_date', startOfMonth.toISOString())
        .lte('scheduled_date', endOfMonth.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Property showings table not found. Please run the migration to create the required tables.');
          setShowings([]);
        } else {
          throw error;
        }
      } else {
        setShowings(data || []);
      }
    } catch (error) {
      console.error('Error fetching showings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
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

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary">Month View - Property Showings</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-secondary-100"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <span className="text-sm font-medium text-text-primary">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-secondary-100"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {showings.length > 0 ? (
          <div className="space-y-4">
            {showings.map((showing) => (
              <div key={showing.id} className="border border-border rounded-lg p-4 hover:bg-secondary-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-text-primary">{showing.properties?.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(showing.status)}`}>
                        {showing.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{showing.properties?.address}</p>
                    <p className="text-sm text-text-secondary mt-1">With: {showing.user_profiles?.full_name}</p>
                    {showing.notes && (
                      <p className="text-xs text-text-tertiary mt-1 italic">"{showing.notes}"</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-tertiary">{formatDate(showing.scheduled_date)}</span>
                  <span className="text-sm text-text-secondary">{formatTime(showing.scheduled_date)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No showings scheduled for this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarViewings;