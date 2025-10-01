import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';

const AnalyticsSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d;
        }).reverse();

        const monthlyData = await Promise.all(last6Months.map(async (monthDate) => {
          const startDate = startOfMonth(monthDate).toISOString();
          const endDate = endOfMonth(monthDate).toISOString();

          const { count: leads } = await supabase
            .from('property_inquiries')
            .select('*, properties!inner(agent_id)', { count: 'exact', head: true })
            .eq('properties.agent_id', user.id)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          const { count: sales } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', user.id)
            .in('status', ['sold', 'rented'])
            .gte('created_at', startDate) // Approximation
            .lte('created_at', endDate);

          return {
            month: format(monthDate, 'MMM'),
            leads: leads || 0,
            sales: sales || 0,
          };
        }));

        setPerformanceData(monthlyData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 h-96 animate-pulse"></div>;
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Performance Analytics</h3>
      </div>
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="leads" stroke="#0EA5E9" strokeWidth={2} name="Leads" />
              <Line type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                <span className="text-sm text-text-secondary">Leads</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                <span className="text-sm text-text-secondary">Sales</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;