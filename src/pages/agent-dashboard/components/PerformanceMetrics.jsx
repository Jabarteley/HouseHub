// src/pages/agent-dashboard/components/PerformanceMetrics.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetrics = () => {
  const metrics = [
    {
      id: 'listings',
      title: 'Active Listings',
      value: '24',
      change: '+3',
      changeType: 'increase',
      icon: 'Home',
      color: 'primary'
    },
    {
      id: 'leads',
      title: 'New Leads',
      value: '18',
      change: '+5',
      changeType: 'increase',
      icon: 'Users',
      color: 'accent'
    },
    {
      id: 'closings',
      title: 'This Month Closings',
      value: '7',
      change: '+2',
      changeType: 'increase',
      icon: 'TrendingUp',
      color: 'success'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$142K',
      change: '+$23K',
      changeType: 'increase',
      icon: 'DollarSign',
      color: 'warning'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-100 text-primary border-primary-500',
      accent: 'bg-accent-100 text-accent-600 border-accent-500',
      success: 'bg-success-100 text-success border-success-500',
      warning: 'bg-warning-100 text-warning border-warning-500'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics?.map((metric) => (
        <div 
          key={metric?.id}
          className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border hover:shadow-elevation-2 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-md ${getColorClasses(metric?.color)}`}>
              <Icon name={metric?.icon} size={24} />
            </div>
            <div className={`text-sm font-medium px-2 py-1 rounded-md ${
              metric?.changeType === 'increase' ?'bg-success-100 text-success' :'bg-error-100 text-error'
            }`}>
              {metric?.change}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {metric?.value}
            </h3>
            <p className="text-text-secondary text-sm">
              {metric?.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;