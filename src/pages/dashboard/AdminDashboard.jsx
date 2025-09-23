import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    pendingApprovals: 0,
    recentActivities: []
  });

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user statistics
      const { data: usersData, error: usersError } = await supabase?.from('user_profiles')?.select('id, full_name, email, role, is_verified, created_at')?.order('created_at', { ascending: false })?.limit(10);

      if (usersError) throw usersError;

      // Load property statistics
      const { data: propertiesData, error: propertiesError } = await supabase?.from('properties')?.select(`
          id, title, price, status, property_type, listing_type,
          created_at, landlord_id,
          user_profiles!landlord_id (full_name)
        `)?.order('created_at', { ascending: false })?.limit(10);

      if (propertiesError) throw propertiesError;

      // Calculate statistics
      const { count: totalUsers } = await supabase?.from('user_profiles')?.select('*', { count: 'exact', head: true });

      const { count: totalProperties } = await supabase?.from('properties')?.select('*', { count: 'exact', head: true });

      const { count: activeListings } = await supabase?.from('properties')?.select('*', { count: 'exact', head: true })?.eq('status', 'active');

      const { count: pendingApprovals } = await supabase?.from('properties')?.select('*', { count: 'exact', head: true })?.eq('status', 'draft');

      setStats({
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        activeListings: activeListings || 0,
        pendingApprovals: pendingApprovals || 0
      });

      setUsers(usersData || []);
      setProperties(propertiesData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProperty = async (propertyId) => {
    try {
      const { error } = await supabase?.from('properties')?.update({ status: 'active' })?.eq('id', propertyId);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error approving property:', error);
    }
  };

  const toggleUserVerification = async (userId, currentStatus) => {
    try {
      const { error } = await supabase?.from('user_profiles')?.update({ is_verified: !currentStatus })?.eq('id', userId);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
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
              Admin Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back, {userProfile?.full_name}. Manage your platform.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="Users" size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Total Users</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="Home" size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Total Properties</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon name="Eye" size={24} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Active Listings</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.activeListings}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Icon name="Clock" size={24} className="text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Pending Approvals</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.pendingApprovals}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Recent Users</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {users?.map((user) => (
                    <div key={user?.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user?.full_name?.split(' ')?.map(n => n?.[0])?.join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-text-primary">
                            {user?.full_name}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {user?.email} • {user?.role}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleUserVerification(user?.id, user?.is_verified)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user?.is_verified
                            ? 'bg-green-100 text-green-800' :'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user?.is_verified ? 'Verified' : 'Unverified'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Recent Properties</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {properties?.map((property) => (
                    <div key={property?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {property?.title}
                        </p>
                        <p className="text-sm text-text-secondary">
                          ${property?.price?.toLocaleString()} • {property?.property_type} • 
                          by {property?.user_profiles?.full_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property?.status === 'active' ?'bg-green-100 text-green-800'
                            : property?.status === 'draft' ?'bg-yellow-100 text-yellow-800' :'bg-gray-100 text-gray-800'
                        }`}>
                          {property?.status}
                        </span>
                        {property?.status === 'draft' && (
                          <button
                            onClick={() => approveProperty(property?.id)}
                            className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;