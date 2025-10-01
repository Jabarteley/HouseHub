// src/pages/agent-dashboard/components/QuickActions.jsx
import React from 'react';
import Icon from '../../../../components/AppIcon';

const QuickActions = ({ onQuickListing }) => {
  const actions = [
    {
      id: 'new-listing',
      title: 'Add Listing',
      description: 'Create a new property listing',
      icon: 'Plus',
      color: 'primary',
      onClick: onQuickListing
    },
    {
      id: 'schedule-showing',
      title: 'Schedule Showing',
      description: 'Book property viewing appointments',
      icon: 'Calendar',
      color: 'accent',
      onClick: () => console.log('Schedule showing')
    },
    {
      id: 'import-leads',
      title: 'Import Leads',
      description: 'Upload leads from CSV or CRM',
      icon: 'Upload',
      color: 'success',
      onClick: () => console.log('Import leads')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create performance analytics',
      icon: 'FileText',
      color: 'warning',
      onClick: () => console.log('Generate report')
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-100 text-primary hover:bg-primary-200 border-primary-500',
      accent: 'bg-accent-100 text-accent-600 hover:bg-accent-200 border-accent-500',
      success: 'bg-success-100 text-success hover:bg-success-200 border-success-500',
      warning: 'bg-warning-100 text-warning hover:bg-warning-200 border-warning-500'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">
          Quick Actions
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions?.map((action) => (
            <button
              key={action?.id}
              onClick={action?.onClick}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-elevation-2 micro-interaction text-left ${
                getColorClasses(action?.color)
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon name={action?.icon} size={20} />
                <span className="font-medium text-sm">
                  {action?.title}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {action?.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;