import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const ActivityTracking = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('activity_log')
        .select(`
          *,
          user:user_profiles (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('action', filter);
      }

      const { data, error } = await query;

      if (error) {
        if (error.message.includes('relation "public.activity_log" does not exist')) {
            console.warn('activity_log table not found. Please ensure migrations are run.');
            setActivities([]);
        } else {
            throw error;
        }
      } else {
        setActivities(data || []);
      }

    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action) => {
    if (!action) return 'Unknown';
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getActionColor = (action) => {
    if (action?.includes('create')) return 'bg-green-100 text-green-800';
    if (action?.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action?.includes('delete')) return 'bg-red-100 text-red-800';
    if (action?.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Activity Tracking</h2>
        <div className="mt-2 md:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-text-primary"
          >
            <option value="all">All Activities</option>
            <option value="user_registered">User Registered</option>
            <option value="property_created">Property Created</option>
            <option value="booking_created">Booking Created</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {activities.map(activity => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {activity.user?.full_name || 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(activity.action)}`}>
                    {getActionLabel(activity.action)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {activity.target_type ? `${activity.target_type} #${activity.target_id?.substring(0, 8)}...` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {activity.details?.description || JSON.stringify(activity.details)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatDateTime(activity.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="mx-auto text-text-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary">No Activities</h3>
          <p className="text-text-secondary">No user activities have been recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTracking;
