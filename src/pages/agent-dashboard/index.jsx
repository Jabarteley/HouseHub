// src/pages/agent-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import PerformanceMetrics from './components/PerformanceMetrics';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import ActiveListings from './components/ActiveListings';
import LeadManagement from './components/LeadManagement';
import UpcomingShowings from './components/UpcomingShowings';
import AnalyticsSection from './components/AnalyticsSection';
import QuickListingForm from './components/QuickListingForm';

const AgentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickListingForm, setShowQuickListingForm] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Simulate real-time notifications
    const notificationTimer = setInterval(() => {
      const mockNotifications = [
        'New lead inquiry for 123 Oak Street',
        'Price reduction approved for 456 Pine Ave',
        'Showing scheduled for tomorrow at 2 PM'
      ];
      const randomNotification = mockNotifications?.[Math.floor(Math.random() * mockNotifications?.length)];
      setNotifications(prev => [{
        id: Date.now(),
        message: randomNotification,
        timestamp: new Date()
      }, ...prev?.slice(0, 4)]);
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(notificationTimer);
    };
  }, []);

  const handleBulkAction = (action, listingIds) => {
    console.log(`Bulk action ${action} for listings:`, listingIds);
    // Implement bulk action logic
  };

  const handleQuickListing = () => {
    setShowQuickListingForm(true);
  };

  const handleListingSubmit = (listingData) => {
    console.log('New listing data:', listingData);
    setShowQuickListingForm(false);
    // Implement listing creation logic
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4 skeleton"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2 skeleton"></div>
            </div>
            
            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="bg-surface p-6 rounded-lg shadow-elevation-1">
                  <div className="h-4 bg-secondary-100 rounded w-1/2 mb-2 skeleton"></div>
                  <div className="h-8 bg-secondary-100 rounded w-3/4 skeleton"></div>
                </div>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-secondary-100 rounded-lg skeleton mb-8"></div>
                <div className="h-96 bg-secondary-100 rounded-lg skeleton"></div>
              </div>
              <div className="space-y-8">
                <div className="h-64 bg-secondary-100 rounded-lg skeleton"></div>
                <div className="h-64 bg-secondary-100 rounded-lg skeleton"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                  Agent Dashboard
                </h1>
                <p className="text-text-secondary">
                  Manage your listings, track leads, and monitor performance
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={handleQuickListing}
                  className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction shadow-elevation-1"
                >
                  Create New Listing
                </button>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <PerformanceMetrics />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <QuickActions onQuickListing={handleQuickListing} />
              
              {/* Active Listings Table */}
              <ActiveListings 
                selectedListings={selectedListings}
                onSelectionChange={setSelectedListings}
                onBulkAction={handleBulkAction}
              />
              
              {/* Analytics Section */}
              <AnalyticsSection />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <RecentActivity notifications={notifications} />
              
              {/* Lead Management */}
              <LeadManagement />
              
              {/* Upcoming Showings */}
              <UpcomingShowings />
            </div>
          </div>
        </div>
      </main>

      {/* Quick Listing Form Modal */}
      {showQuickListingForm && (
        <QuickListingForm 
          onClose={() => setShowQuickListingForm(false)}
          onSubmit={handleListingSubmit}
        />
      )}
    </div>
  );
};

export default AgentDashboard;