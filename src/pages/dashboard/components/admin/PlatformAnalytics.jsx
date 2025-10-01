import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const PlatformAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        const { count: propertyCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        const { count: activePropertyCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        const { count: inquiryCount } = await supabase
          .from('property_inquiries')
          .select('*', { count: 'exact', head: true });

        setStats({
          users: userCount,
          properties: propertyCount,
          active: activePropertyCount,
          inquiries: inquiryCount,
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const analyticsCards = [
    { 
      label: 'Total Users', 
      value: stats?.users, 
      icon: 'Users',
      color: 'blue'
    },
    { 
      label: 'Total Properties', 
      value: stats?.properties, 
      icon: 'Home',
      color: 'purple'
    },
    { 
      label: 'Active Listings', 
      value: stats?.active, 
      icon: 'Eye',
      color: 'green'
    },
    { 
      label: 'Total Inquiries', 
      value: stats?.inquiries, 
      icon: 'MessageSquare',
      color: 'orange'
    },
  ];

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-secondary-100 rounded-lg"></div>
          <div className="h-20 bg-secondary-100 rounded-lg"></div>
          <div className="h-20 bg-secondary-100 rounded-lg"></div>
          <div className="h-20 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Platform Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        {analyticsCards.map(card => (
          <div key={card.label} className={`bg-secondary-100 p-4 rounded-lg`}>
            <div className="flex items-center">
              <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
                <Icon name={card.icon} size={20} className={`text-${card.color}-600`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-secondary">{card.label}</p>
                <p className="text-2xl font-bold text-text-primary">{card.value ?? 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformAnalytics;
