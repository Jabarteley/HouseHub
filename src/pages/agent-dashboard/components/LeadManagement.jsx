// src/pages/agent-dashboard/components/LeadManagement.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LeadManagement = () => {
  const [draggedLead, setDraggedLead] = useState(null);

  const columns = [
    {
      id: 'new',
      title: 'New',
      color: 'secondary',
      leads: [
        { id: 1, name: 'John Smith', property: '123 Oak Street', score: 85 },
        { id: 2, name: 'Sarah Johnson', property: '456 Pine Avenue', score: 92 }
      ]
    },
    {
      id: 'contacted',
      title: 'Contacted',
      color: 'primary',
      leads: [
        { id: 3, name: 'Mike Davis', property: '789 Maple Drive', score: 78 },
        { id: 4, name: 'Lisa Chen', property: '321 Elm Court', score: 88 }
      ]
    },
    {
      id: 'showing',
      title: 'Showing Scheduled',
      color: 'warning',
      leads: [
        { id: 5, name: 'Robert Brown', property: '555 Cedar Lane', score: 95 }
      ]
    },
    {
      id: 'offer',
      title: 'Offer Pending',
      color: 'success',
      leads: [
        { id: 6, name: 'Emily Wilson', property: '777 Birch Road', score: 98 }
      ]
    }
  ];

  const handleDragStart = (e, lead, sourceColumn) => {
    setDraggedLead({ lead, sourceColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    e?.preventDefault();
    if (draggedLead && draggedLead?.sourceColumn !== targetColumn) {
      console.log(`Moving lead ${draggedLead?.lead?.name} from ${draggedLead?.sourceColumn} to ${targetColumn}`);
      // Implement lead status update logic
    }
    setDraggedLead(null);
  };

  const getColumnColor = (color) => {
    const colorMap = {
      secondary: 'border-secondary-300 bg-secondary-100',
      primary: 'border-primary-300 bg-primary-100',
      warning: 'border-warning-300 bg-warning-100',
      success: 'border-success-300 bg-success-100'
    };
    return colorMap?.[color] || colorMap?.secondary;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-success-100 text-success';
    if (score >= 75) return 'bg-warning-100 text-warning';
    return 'bg-secondary-100 text-secondary-600';
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary font-heading">
            Lead Pipeline
          </h3>
          <button className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-200">
            Manage All
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {columns?.map((column) => (
            <div
              key={column?.id}
              className={`rounded-lg border-2 border-dashed p-4 min-h-[200px] transition-colors duration-200 ${
                getColumnColor(column?.color)
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column?.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-text-primary">
                  {column?.title}
                </h4>
                <span className="text-xs bg-surface px-2 py-1 rounded-md text-text-secondary">
                  {column?.leads?.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {column?.leads?.map((lead) => (
                  <div
                    key={lead?.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead, column?.id)}
                    className="bg-surface p-3 rounded-md shadow-elevation-1 cursor-move hover:shadow-elevation-2 transition-all duration-200 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-text-primary text-sm">
                        {lead?.name}
                      </h5>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        getScoreColor(lead?.score)
                      }`}>
                        {lead?.score}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {lead?.property}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                        <Icon name="Phone" size={12} />
                      </button>
                      <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                        <Icon name="Mail" size={12} />
                      </button>
                      <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                        <Icon name="MessageSquare" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {column?.leads?.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Users" size={32} className="mx-auto text-secondary-300 mb-2" />
                  <p className="text-text-secondary text-sm">No leads</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadManagement;