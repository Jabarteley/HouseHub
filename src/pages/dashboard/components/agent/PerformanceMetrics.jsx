import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const PerformanceMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);

        // Fetch active listings
        const { count: listingsCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', user.id)
          .eq('status', 'active');

        // Fetch new leads (inquiries in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: leadsCount } = await supabase
          .from('property_inquiries')
          .select('*, properties!inner(agent_id)', { count: 'exact', head: true })
          .eq('properties.agent_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Fetch closings (sold/rented in last 30 days)
        const { count: closingsCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', user.id)
          .in('status', ['sold', 'rented'])
          .gte('created_at', thirtyDaysAgo.toISOString()); // Note: This assumes created_at is updated on status change

        // Fetch total revenue/commission with better error handling
        let performanceData = null;
        let commissionValue = 0;
        
        try {
          // Try to get data with a more general query
          const { data: directData, error: directError } = await supabase
            .from('agent_performance')
            .select('total_commission')
            .eq('agent_id', user.id)
            .single();
            
          if (!directError && directData) {
            performanceData = directData;
            commissionValue = directData.total_commission || 0;
          } else if (directError && directError.code !== 'PGRST116') { // Record not found is OK
            console.warn('Direct query error:', directError);
            // Try the RPC approach as fallback
            try {
              const { data: rpcData, error: rpcError } = await supabase.rpc('get_agent_performance_safe', { 
                p_agent_id: user.id 
              });
              
              if (!rpcError && rpcData && rpcData.length > 0) {
                performanceData = rpcData[0];
                commissionValue = rpcData[0].total_commission || 0;
              }
            } catch (rpcError) {
              console.warn('RPC query also failed:', rpcError);
            }
          }
        } catch (error) {
          console.warn('Error fetching agent performance:', error);
        }

        setMetrics([
          {
            id: 'listings',
            title: 'Active Listings',
            value: listingsCount ?? 0,
            icon: 'Home',
            color: 'primary'
          },
          {
            id: 'leads',
            title: 'New Leads (30d)',
            value: leadsCount ?? 0,
            icon: 'Users',
            color: 'accent'
          },
          {
            id: 'closings',
            title: 'Closings (30d)',
            value: closingsCount ?? 0,
            icon: 'TrendingUp',
            color: 'success'
          },
          {
            id: 'revenue',
            title: 'Total Commission',
            value: `${commissionValue.toLocaleString()}`,
            icon: 'DollarSign',
            color: 'warning'
          }
        ]);

      } catch (error) {
        console.error('Error fetching performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-100 text-primary border-primary-500',
      accent: 'bg-accent-100 text-accent-600 border-accent-500',
      success: 'bg-success-100 text-success border-success-500',
      warning: 'bg-warning-100 text-warning border-warning-500'
    };
    return colorMap[color] || colorMap.primary;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface p-6 rounded-lg shadow-elevation-1 animate-pulse">
            <div className="h-12 w-12 bg-secondary-100 rounded-md mb-4"></div>
            <div className="h-8 bg-secondary-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics?.map((metric) => (
        <div 
          key={metric.id}
          className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border hover:shadow-elevation-2 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-md ${getColorClasses(metric.color)}`}>
              <Icon name={metric.icon} size={24} />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {metric.value}
            </h3>
            <p className="text-text-secondary text-sm">
              {metric.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;