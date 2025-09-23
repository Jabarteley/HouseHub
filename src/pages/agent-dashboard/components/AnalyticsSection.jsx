// src/pages/agent-dashboard/components/AnalyticsSection.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const AnalyticsSection = () => {
  const [dateRange, setDateRange] = useState('30');
  const [activeChart, setActiveChart] = useState('performance');

  const performanceData = [
    { month: 'Jan', listings: 12, leads: 45, sales: 5 },
    { month: 'Feb', listings: 15, leads: 52, sales: 7 },
    { month: 'Mar', listings: 18, leads: 48, sales: 6 },
    { month: 'Apr', listings: 20, leads: 62, sales: 9 },
    { month: 'May', listings: 24, leads: 68, sales: 8 },
    { month: 'Jun', listings: 22, leads: 55, sales: 10 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 62000 },
    { month: 'May', revenue: 68000 },
    { month: 'Jun', revenue: 75000 }
  ];

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  const chartTypes = [
    { id: 'performance', label: 'Performance', icon: 'TrendingUp' },
    { id: 'revenue', label: 'Revenue', icon: 'DollarSign' }
  ];

  const handleExport = (format) => {
    console.log(`Exporting analytics data as ${format}`);
    // Implement export logic
  };

  const formatRevenue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(value);
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4 md:mb-0">
            Performance Analytics
          </h3>
          
          <div className="flex items-center space-x-4">
            {/* Chart Type Toggle */}
            <div className="flex items-center space-x-1 bg-secondary-100 rounded-md p-1">
              {chartTypes?.map((type) => (
                <button
                  key={type?.id}
                  onClick={() => setActiveChart(type?.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    activeChart === type?.id
                      ? 'bg-surface text-text-primary shadow-elevation-1'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon name={type?.icon} size={14} />
                  <span>{type?.label}</span>
                </button>
              ))}
            </div>
            
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e?.target?.value)}
              className="border border-border rounded-md px-3 py-1 text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {dateRanges?.map((range) => (
                <option key={range?.value} value={range?.value}>
                  {range?.label}
                </option>
              ))}
            </select>
            
            {/* Export Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => e?.target?.value && handleExport(e?.target?.value)}
                className="border border-border rounded-md px-3 py-1 text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                defaultValue=""
              >
                <option value="" disabled>Export</option>
                <option value="pdf">Export as PDF</option>
                <option value="excel">Export as Excel</option>
                <option value="csv">Export as CSV</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Performance Chart */}
        {activeChart === 'performance' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748B"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="listings" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', r: 4 }}
                  name="Listings"
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  dot={{ fill: '#0EA5E9', r: 4 }}
                  name="Leads"
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669', r: 4 }}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Revenue Chart */}
        {activeChart === 'revenue' && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748B"
                  fontSize={12}
                  tickFormatter={formatRevenue}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [formatRevenue(value), 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#D97706"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Chart Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          {activeChart === 'performance' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-text-secondary">Listings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-text-secondary">Leads</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-text-secondary">Sales</span>
              </div>
            </>
          )}
          {activeChart === 'revenue' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm text-text-secondary">Monthly Revenue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;