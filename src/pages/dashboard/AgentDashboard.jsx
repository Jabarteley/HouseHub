import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';

const AgentDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    propertiesManaged: 0,
    activeListings: 0,
    upcomingShowings: 0,
    totalCommission: 0
  });

  const [managedProperties, setManagedProperties] = useState([]);
  const [upcomingShowings, setUpcomingShowings] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);

      // Load agent's managed properties
      const { data: propertiesData, error: propertiesError } = await supabase?.from('properties')?.select(`
          *, 
          property_images (image_url, is_primary),
          user_profiles!landlord_id (full_name)
        `)?.eq('agent_id', userProfile?.id)?.order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Load upcoming showings
      const { data: showingsData, error: showingsError } = await supabase?.from('property_showings')?.select(`
          *, 
          properties (title, address),
          user_profiles!student_id (full_name, email)
        `)?.eq('agent_id', userProfile?.id)?.eq('status', 'scheduled')?.gte('scheduled_date', new Date()?.toISOString())?.order('scheduled_date', { ascending: true })?.limit(10);

      if (showingsError) throw showingsError;

      // Load agent performance
      const { data: performanceData, error: performanceError } = await supabase?.from('agent_performance')?.select('*')?.eq('agent_id', userProfile?.id)?.single();

      if (performanceError && performanceError?.code !== 'PGRST116') {
        throw performanceError;
      }

      // Calculate statistics
      const propertiesManaged = propertiesData?.length || 0;
      const activeListings = propertiesData?.filter(p => p?.status === 'active')?.length || 0;
      const upcomingShowingsCount = showingsData?.length || 0;
      const totalCommission = performanceData?.total_commission || 0;

      setStats({
        propertiesManaged,
        activeListings,
        upcomingShowings: upcomingShowingsCount,
        totalCommission
      });

      setManagedProperties(propertiesData || []);
      setUpcomingShowings(showingsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateShowingStatus = async (showingId, newStatus) => {
    try {
      const { error } = await supabase?.from('property_showings')?.update({ status: newStatus })?.eq('id', showingId);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error updating showing status:', error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary-100 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)]?.map((_, i) => (
                  <div key={i} className="h-32 bg-secondary-100 rounded-lg"></div>
                ))}
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
            <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
              Agent Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back, {userProfile?.full_name}. Manage your listings and clients.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="Home" size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Properties Managed</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.propertiesManaged}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="Eye" size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Active Listings</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.activeListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon name="Calendar" size={24} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Upcoming Showings</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.upcomingShowings}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="DollarSign" size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Total Commission</p>
                  <p className="text-2xl font-bold text-text-primary">${stats?.totalCommission?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Managed Properties */}
            <div className="lg:col-span-2 bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Managed Properties</h2>
              </div>
              <div className="p-6">
                {managedProperties?.length > 0 ? (
                  <div className="space-y-4">
                    {managedProperties?.map((property) => (
                      <div key={property?.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary mb-1">
                              {property?.title}
                            </h3>
                            <p className="text-sm text-text-secondary mb-2">
                              Owner: {property?.user_profiles?.full_name}
                            </p>
                            <p className="text-sm text-text-secondary mb-2">
                              {property?.address}, {property?.city}, {property?.state}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-text-secondary">
                              <span>${property?.price?.toLocaleString()}</span>
                              <span>{property?.property_type}</span>
                              <span>{property?.bedrooms} bed, {property?.bathrooms} bath</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property?.status === 'active' ?'bg-green-100 text-green-800'
                              : property?.status === 'draft' ?'bg-yellow-100 text-yellow-800' :'bg-gray-100 text-gray-800'
                          }`}>
                            {property?.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">No properties assigned</h3>
                    <p className="text-text-secondary">
                      You will see properties here once landlords assign them to you.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Showings */}
            <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Upcoming Showings</h2>
              </div>
              <div className="p-6">
                {upcomingShowings?.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingShowings?.slice(0, 5)?.map((showing) => (
                      <div key={showing?.id} className="border border-border rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">
                              {showing?.properties?.title}
                            </p>
                            <p className="text-xs text-text-secondary">
                              Client: {showing?.user_profiles?.full_name}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {formatDateTime(showing?.scheduled_date)}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => updateShowingStatus(showing?.id, 'confirmed')}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateShowingStatus(showing?.id, 'cancelled')}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Calendar" size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No upcoming showings</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className="mt-8 bg-surface rounded-lg shadow-elevation-1 border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Performance Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">{stats?.propertiesManaged}</p>
                  <p className="text-sm text-text-secondary">Properties Managed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">0</p>
                  <p className="text-sm text-text-secondary">Successful Deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">0.0</p>
                  <p className="text-sm text-text-secondary">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;