import React from 'react';
import Icon from '../../../../components/AppIcon';

const UpcomingShowings = ({ showings }) => {
  const getStatusColor = (status) => {
    const map = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Upcoming Showings</h2>
      </div>
      <div className="p-6">
        {showings.length > 0 ? (
          <div className="space-y-4">
            {showings.map(showing => (
              <div key={showing.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{showing.properties.title}</p>
                  <p className="text-xs text-text-secondary">{new Date(showing.scheduled_date).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showing.status)}`}>
                  {showing.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">You have no upcoming showings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingShowings;
