// src/pages/agent-dashboard/components/UpcomingShowings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingShowings = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const showings = [
    {
      id: 1,
      time: '10:00 AM',
      duration: '1 hour',
      property: '123 Oak Street',
      client: 'John & Mary Smith',
      status: 'confirmed',
      conflict: false
    },
    {
      id: 2,
      time: '2:00 PM',
      duration: '45 min',
      property: '456 Pine Avenue',
      client: 'Sarah Johnson',
      status: 'pending',
      conflict: false
    },
    {
      id: 3,
      time: '4:00 PM',
      duration: '1 hour',
      property: '789 Maple Drive',
      client: 'Mike Davis',
      status: 'confirmed',
      conflict: true
    }
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      'confirmed': 'bg-success-100 text-success',
      'pending': 'bg-warning-100 text-warning',
      'cancelled': 'bg-error-100 text-error'
    };
    return statusMap?.[status] || statusMap?.confirmed;
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReschedule = (showingId) => {
    console.log(`Reschedule showing ${showingId}`);
    // Implement reschedule logic
  };

  const handleCancel = (showingId) => {
    console.log(`Cancel showing ${showingId}`);
    // Implement cancel logic
  };

  const handleSendReminder = (showingId) => {
    console.log(`Send reminder for showing ${showingId}`);
    // Implement reminder logic
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary font-heading">
            Upcoming Showings
          </h3>
          <button className="bg-primary text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200 ease-out">
            Schedule New
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4 p-3 bg-secondary-100 rounded-md">
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
            className="text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <span className="text-sm font-medium text-text-primary">
            {formatDate(selectedDate)}
          </span>
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
            className="text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
        
        {/* Showings List */}
        <div className="space-y-3">
          {showings?.map((showing) => (
            <div 
              key={showing?.id}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-elevation-2 ${
                showing?.conflict 
                  ? 'border-error bg-error-100' :'border-border bg-background'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-text-primary">
                      {showing?.time}
                    </span>
                    <span className="text-xs text-text-secondary">
                      ({showing?.duration})
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      getStatusColor(showing?.status)
                    }`}>
                      {showing?.status}
                    </span>
                    {showing?.conflict && (
                      <div className="flex items-center space-x-1 text-error">
                        <Icon name="AlertTriangle" size={14} />
                        <span className="text-xs font-medium">Conflict</span>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-text-primary text-sm mb-1">
                    {showing?.property}
                  </h4>
                  
                  <div className="flex items-center space-x-1 text-text-secondary">
                    <Icon name="User" size={12} />
                    <span className="text-xs">{showing?.client}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleSendReminder(showing?.id)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                    title="Send reminder"
                  >
                    <Icon name="Bell" size={16} />
                  </button>
                  <button 
                    onClick={() => handleReschedule(showing?.id)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                    title="Reschedule"
                  >
                    <Icon name="Calendar" size={16} />
                  </button>
                  <button 
                    onClick={() => handleCancel(showing?.id)}
                    className="text-text-secondary hover:text-error transition-colors duration-200"
                    title="Cancel"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {showings?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="mx-auto text-secondary-300 mb-3" />
            <p className="text-text-secondary">No showings scheduled</p>
            <button className="mt-2 text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200">
              Schedule your first showing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingShowings;