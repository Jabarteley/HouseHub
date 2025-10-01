import React from 'react';
import Icon from '../../../../components/AppIcon';

const LandlordStats = ({ stats }) => {
  const statCards = [
    { id: 'total', label: 'Total Properties', value: stats.totalProperties, icon: 'Home', color: 'blue' },
    { id: 'active', label: 'Active Listings', value: stats.activeListings, icon: 'Eye', color: 'green' },
    { id: 'inquiries', label: 'Total Inquiries', value: stats.totalInquiries, icon: 'MessageSquare', color: 'purple' },
    { id: 'revenue', label: 'Potential Revenue', value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: 'DollarSign', color: 'green' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map(card => (
        <div key={card.id} className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
          <div className="flex items-center">
            <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
              <Icon name={card.icon} size={24} className={`text-${card.color}-600`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">{card.label}</p>
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LandlordStats;
