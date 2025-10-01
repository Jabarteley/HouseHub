// src/pages/dashboard/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import AssignedProperties from './components/agent/AssignedProperties';
import CommissionLedger from './components/agent/CommissionLedger';
import ClientList from './components/agent/ClientList';
import CalendarViewings from './components/agent/CalendarViewings';
import PerformanceMetrics from './components/agent/PerformanceMetrics';
import RecentActivity from './components/agent/RecentActivity';
import QuickActions from './components/agent/QuickActions';
import ActiveListings from './components/agent/ActiveListings';
import LeadManagement from './components/agent/LeadManagement';
import UpcomingShowings from './components/agent/UpcomingShowings';
import AnalyticsSection from './components/agent/AnalyticsSection';
import QuickListingForm from './components/agent/QuickListingForm';

const AgentDashboard = () => {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickListingForm, setShowQuickListingForm] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);

  useEffect(() => {
    if(user) {
        setIsLoading(false);
    }
  }, [user]);

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
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
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
              
              {/* Assigned Properties */}
              <AssignedProperties />
              
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
              <RecentActivity />
              
              {/* Client List */}
              <ClientList />
              
              {/* Commission Ledger */}
              <CommissionLedger />
              
              {/* Calendar Viewings */}
              <CalendarViewings />
              
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