import React from 'react';
import Icon from '../../../../components/AppIcon';

const RecentApplications = ({ applications }) => {
  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Recent Applications</h2>
      </div>
      <div className="p-6">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{app.properties.title}</p>
                  <p className="text-xs text-text-secondary">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">You haven't submitted any applications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentApplications;
