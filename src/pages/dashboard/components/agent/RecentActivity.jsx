import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);

        const { data: inquiries, error: inquiriesError } = await supabase
          .from('property_inquiries')
          .select('id, created_at, status, properties!inner(title, agent_id)')
          .eq('properties.agent_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (inquiriesError) throw inquiriesError;

        const { data: showings, error: showingsError } = await supabase
          .from('property_showings')
          .select('id, scheduled_date, status, properties!inner(title, agent_id)')
          .eq('properties.agent_id', user.id)
          .order('scheduled_date', { ascending: false })
          .limit(5);
        if (showingsError) throw showingsError;

        const formattedInquiries = inquiries.map(a => ({ ...a, type: 'inquiry' }));
        const formattedShowings = showings.map(a => ({ ...a, type: 'showing', created_at: a.scheduled_date }));

        const combined = [...formattedInquiries, ...formattedShowings]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setActivities(combined);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const getActivityDetails = (activity) => {
    switch (activity.type) {
      case 'inquiry':
        return { 
          message: `New inquiry for ${activity.properties.title}`,
          icon: 'MessageSquare', 
          color: 'primary' 
        };
      case 'showing':
        return { 
          message: `Showing for ${activity.properties.title} is ${activity.status}`,
          icon: 'Calendar', 
          color: 'warning' 
        };
      default:
        return { message: 'New activity', icon: 'Bell', color: 'secondary' };
    }
  };

  if (loading) {
    return <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 h-96 animate-pulse"></div>;
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Recent Activity</h3>
      </div>
      <div className="p-6">
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const { message, icon, color } = getActivityDetails(activity);
              return (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-md flex-shrink-0 bg-${color}-100 text-${color}-600`}>
                    <Icon name={icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{message}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="mx-auto text-secondary-300 mb-3" />
            <p className="text-text-secondary">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
