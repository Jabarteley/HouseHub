// src/pages/agent-dashboard/components/RecentActivity.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = ({ notifications = [] }) => {
  const defaultActivities = [
    {
      id: 1,
      type: 'lead',
      message: 'New lead inquiry for 123 Oak Street',
      timestamp: '2 minutes ago',
      icon: 'User',
      color: 'primary'
    },
    {
      id: 2,
      type: 'listing',
      message: 'Listing updated: 456 Pine Avenue',
      timestamp: '15 minutes ago',
      icon: 'Home',
      color: 'accent'
    },
    {
      id: 3,
      type: 'showing',
      message: 'Showing scheduled for tomorrow at 2:00 PM',
      timestamp: '1 hour ago',
      icon: 'Calendar',
      color: 'warning'
    },
    {
      id: 4,
      type: 'closing',
      message: 'Closing completed: 789 Maple Drive',
      timestamp: '3 hours ago',
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      id: 5,
      type: 'lead',
      message: 'Lead converted to client: Sarah Johnson',
      timestamp: '1 day ago',
      icon: 'UserCheck',
      color: 'success'
    }
  ];

  const activities = notifications?.length > 0 
    ? [...notifications?.slice(0, 3), ...defaultActivities?.slice(0, 2)]
    : defaultActivities;

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-100 text-primary',
      accent: 'bg-accent-100 text-accent-600',
      success: 'bg-success-100 text-success',
      warning: 'bg-warning-100 text-warning'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp instanceof Date) {
      const now = new Date();
      const diff = Math.floor((now - timestamp) / 1000); // seconds
      
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      return `${Math.floor(diff / 86400)} days ago`;
    }
    return timestamp;
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary font-heading">
            Recent Activity
          </h3>
          <button className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-200">
            View All
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {activities?.map((activity, index) => (
            <div key={activity?.id || index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-md flex-shrink-0 ${getColorClasses(activity?.color || 'primary')}`}>
                <Icon name={activity?.icon || 'Bell'} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                  {activity?.message}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {formatTimestamp(activity?.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {activities?.length === 0 && (
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