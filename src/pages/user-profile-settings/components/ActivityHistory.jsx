// src/pages/user-profile-settings/components/ActivityHistory.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ActivityHistory = ({ user, onDataChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedType, setSelectedType] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);

  const activityData = [
    {
      id: '1',
      type: 'property_view',
      title: 'Viewed Property',
      description: 'Modern Downtown Condo - 123 Main Street',
      timestamp: '2024-01-15T14:30:00Z',
      metadata: { propertyId: 'prop_123', price: '$425,000' }
    },
    {
      id: '2',
      type: 'search',
      title: 'Property Search',
      description: 'Searched for "3 bedroom houses under $500K"',
      timestamp: '2024-01-15T10:15:00Z',
      metadata: { query: '3 bedroom houses under $500K', results: 23 }
    },
    {
      id: '3',
      type: 'favorite_added',
      title: 'Added to Favorites',
      description: 'Charming Suburban Home - 456 Oak Avenue',
      timestamp: '2024-01-14T16:45:00Z',
      metadata: { propertyId: 'prop_456', price: '$675,000' }
    },
    {
      id: '4',
      type: 'message_sent',
      title: 'Message Sent',
      description: 'Inquired about property tour availability',
      timestamp: '2024-01-14T09:20:00Z',
      metadata: { recipientType: 'agent', propertyId: 'prop_789' }
    },
    {
      id: '5',
      type: 'profile_updated',
      title: 'Profile Updated',
      description: 'Updated contact information',
      timestamp: '2024-01-13T11:30:00Z',
      metadata: { fields: ['phone', 'email'] }
    },
    {
      id: '6',
      type: 'saved_search',
      title: 'Saved Search Created',
      description: 'Downtown Condos - $300K-$500K range',
      timestamp: '2024-01-12T13:15:00Z',
      metadata: { searchId: 'search_123', frequency: 'daily' }
    },
    {
      id: '7',
      type: 'login',
      title: 'Account Login',
      description: 'Signed in from Chrome on MacOS',
      timestamp: '2024-01-12T08:45:00Z',
      metadata: { device: 'Chrome on MacOS', ip: '192.168.1.1' }
    },
    {
      id: '8',
      type: 'property_view',
      title: 'Viewed Property',
      description: 'Luxury Waterfront Villa - 789 Lakeside Drive',
      timestamp: '2024-01-11T15:20:00Z',
      metadata: { propertyId: 'prop_789', price: '$1,250,000' }
    }
  ];

  const periodOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 3 months' },
    { value: '1year', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'property_view', label: 'Property Views' },
    { value: 'search', label: 'Searches' },
    { value: 'favorite_added', label: 'Favorites' },
    { value: 'message_sent', label: 'Messages' },
    { value: 'profile_updated', label: 'Profile Updates' },
    { value: 'login', label: 'Logins' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'property_view': return 'Eye';
      case 'search': return 'Search';
      case 'favorite_added': return 'Heart';
      case 'message_sent': return 'MessageCircle';
      case 'profile_updated': return 'User';
      case 'saved_search': return 'Bookmark';
      case 'login': return 'LogIn';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'property_view': return 'text-primary';
      case 'search': return 'text-accent-600';
      case 'favorite_added': return 'text-error';
      case 'message_sent': return 'text-success';
      case 'profile_updated': return 'text-warning';
      case 'saved_search': return 'text-primary';
      case 'login': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return date?.toLocaleDateString();
      }
    }
  };

  const filteredActivities = activityData?.filter(activity => {
    if (selectedType !== 'all' && activity?.type !== selectedType) {
      return false;
    }
    
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    
    switch (selectedPeriod) {
      case '7days':
        return (now - activityDate) <= (7 * 24 * 60 * 60 * 1000);
      case '30days':
        return (now - activityDate) <= (30 * 24 * 60 * 60 * 1000);
      case '90days':
        return (now - activityDate) <= (90 * 24 * 60 * 60 * 1000);
      case '1year':
        return (now - activityDate) <= (365 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const handleExportData = (format) => {
    const exportData = {
      exportDate: new Date()?.toISOString(),
      period: selectedPeriod,
      activityType: selectedType,
      totalRecords: filteredActivities?.length,
      activities: filteredActivities
    };
    
    let dataStr, filename, mimeType;
    
    if (format === 'json') {
      dataStr = JSON.stringify(exportData, null, 2);
      filename = `activity-history-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = ['Date', 'Type', 'Title', 'Description'];
      const csvData = filteredActivities?.map(activity => [
        new Date(activity.timestamp)?.toLocaleString(),
        activity?.type,
        activity?.title,
        activity?.description
      ]);
      
      dataStr = [headers, ...csvData]?.map(row => 
        row?.map(cell => `"${cell}"`)?.join(',')
      )?.join('\n');
      
      filename = `activity-history-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      mimeType = 'text/csv';
    }
    
    const dataBlob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  const getActivityStats = () => {
    const stats = {};
    filteredActivities?.forEach(activity => {
      stats[activity.type] = (stats?.[activity?.type] || 0) + 1;
    });
    return stats;
  };

  const stats = getActivityStats();

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary font-heading">
              Activity History
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Track your recent activity and account actions
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              {periodOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-md text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              {typeOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Icon name="Download" size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Activity Stats */}
        {Object.keys(stats)?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats)?.map(([type, count]) => {
                const typeOption = typeOptions?.find(opt => opt?.value === type);
                return (
                  <div key={type} className="bg-secondary-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getActivityIcon(type)} 
                        size={16} 
                        className={getActivityColor(type)} 
                      />
                      <span className="text-sm font-medium text-text-primary">{count}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {typeOption?.label || type}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity List */}
        {filteredActivities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Activity Found</h3>
            <p className="text-text-secondary">
              No activity found for the selected period and type.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities?.map((activity) => (
              <div key={activity?.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-secondary-100 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Icon 
                      name={getActivityIcon(activity?.type)} 
                      size={20} 
                      className={getActivityColor(activity?.type)} 
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-text-primary">
                        {activity?.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        {activity?.description}
                      </p>
                      
                      {/* Metadata */}
                      {activity?.metadata && (
                        <div className="mt-2 text-xs text-text-secondary space-y-1">
                          {activity?.type === 'property_view' && activity?.metadata?.price && (
                            <div>Price: {activity?.metadata?.price}</div>
                          )}
                          {activity?.type === 'search' && activity?.metadata?.results && (
                            <div>{activity?.metadata?.results} results found</div>
                          )}
                          {activity?.type === 'login' && activity?.metadata?.device && (
                            <div>Device: {activity?.metadata?.device}</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <span className="text-xs text-text-secondary">
                        {formatTimestamp(activity?.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Load More */}
        {filteredActivities?.length > 0 && (
          <div className="text-center mt-6">
            <button className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200">
              Load More Activity
            </button>
          </div>
        )}
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Export Activity Data</h3>
            
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Export your activity history for personal records. Choose your preferred format:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExportData('json')}
                  className="w-full flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary-100 transition-colors duration-200"
                >
                  <Icon name="FileText" size={20} className="text-primary" />
                  <div className="text-left">
                    <div className="font-medium text-text-primary">JSON Format</div>
                    <div className="text-sm text-text-secondary">Machine-readable format with all metadata</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExportData('csv')}
                  className="w-full flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary-100 transition-colors duration-200"
                >
                  <Icon name="Table" size={20} className="text-primary" />
                  <div className="text-left">
                    <div className="font-medium text-text-primary">CSV Format</div>
                    <div className="text-sm text-text-secondary">Spreadsheet-compatible format</div>
                  </div>
                </button>
              </div>
              
              <div className="p-3 bg-secondary-100 rounded-lg">
                <div className="text-sm text-text-secondary">
                  <strong>Export includes:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{filteredActivities?.length} activity records</li>
                    <li>Date range: {periodOptions?.find(p => p?.value === selectedPeriod)?.label}</li>
                    <li>Activity type: {typeOptions?.find(t => t?.value === selectedType)?.label}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;