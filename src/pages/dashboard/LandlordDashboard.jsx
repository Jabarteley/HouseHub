import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';

const LandlordDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalInquiries: 0,
    monthlyRevenue: 0
  });

  const [properties, setProperties] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);

      // Load landlord's properties
      const { data: propertiesData, error: propertiesError } = await supabase?.from('properties')?.select(`
          *, 
          property_images (image_url, is_primary),
          property_inquiries (id, status, created_at)
        `)?.eq('landlord_id', userProfile?.id)?.order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Load recent inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase?.from('property_inquiries')?.select(`
          *, 
          properties (title),
          user_profiles!student_id (full_name, email)
        `)?.in('property_id', (propertiesData || [])?.map(p => p?.id))?.order('created_at', { ascending: false })?.limit(10);

      if (inquiriesError) throw inquiriesError;

      // Calculate statistics
      const totalProperties = propertiesData?.length || 0;
      const activeListings = propertiesData?.filter(p => p?.status === 'active')?.length || 0;
      const totalInquiries = inquiriesData?.length || 0;
      const monthlyRevenue = propertiesData?.reduce((sum, p) => {
        return sum + (p?.monthly_rent || 0);
      }, 0) || 0;

      setStats({
        totalProperties,
        activeListings,
        totalInquiries,
        monthlyRevenue
      });

      setProperties(propertiesData || []);
      setRecentInquiries(inquiriesData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId, newStatus) => {
    try {
      const { error } = await supabase?.from('properties')?.update({ status: newStatus })?.eq('id', propertyId);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const deleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase?.from('properties')?.delete()?.eq('id', propertyId);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting property:', error);
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                  Landlord Dashboard
                </h1>
                <p className="text-text-secondary">
                  Welcome back, {userProfile?.full_name}. Manage your properties.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setShowPropertyForm(true)}
                  className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction shadow-elevation-1"
                >
                  <Icon name="Plus" size={20} className="inline mr-2" />
                  Add New Property
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="Home" size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Total Properties</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.totalProperties}</p>
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
                  <Icon name="MessageSquare" size={24} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Total Inquiries</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.totalInquiries}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="DollarSign" size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-text-primary">${stats?.monthlyRevenue?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Properties List */}
            <div className="lg:col-span-2 bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Your Properties</h2>
              </div>
              <div className="p-6">
                {properties?.length > 0 ? (
                  <div className="space-y-4">
                    {properties?.map((property) => (
                      <div key={property?.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary mb-1">
                              {property?.title}
                            </h3>
                            <p className="text-sm text-text-secondary mb-2">
                              {property?.address}, {property?.city}, {property?.state}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-text-secondary">
                              <span>${property?.price?.toLocaleString()}</span>
                              <span>{property?.property_type}</span>
                              <span>{property?.bedrooms} bed, {property?.bathrooms} bath</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property?.status === 'active' ?'bg-green-100 text-green-800'
                                : property?.status === 'draft' ?'bg-yellow-100 text-yellow-800' :'bg-gray-100 text-gray-800'
                            }`}>
                              {property?.status}
                            </span>
                            <select
                              value={property?.status}
                              onChange={(e) => updatePropertyStatus(property?.id, e?.target?.value)}
                              className="text-xs border border-border rounded px-2 py-1"
                            >
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="rented">Rented</option>
                              <option value="sold">Sold</option>
                            </select>
                            <button
                              onClick={() => deleteProperty(property?.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          </div>
                        </div>
                        {property?.property_inquiries?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-text-secondary">
                              {property?.property_inquiries?.length} inquir{property?.property_inquiries?.length === 1 ? 'y' : 'ies'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">No properties yet</h3>
                    <p className="text-text-secondary mb-4">
                      Start by adding your first property to the marketplace.
                    </p>
                    <button
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Add Property
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Recent Inquiries</h2>
              </div>
              <div className="p-6">
                {recentInquiries?.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiries?.slice(0, 5)?.map((inquiry) => (
                      <div key={inquiry?.id} className="border border-border rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">
                              {inquiry?.user_profiles?.full_name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {inquiry?.properties?.title}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {inquiry?.message?.substring(0, 80)}...
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry?.status === 'pending' ?'bg-yellow-100 text-yellow-800'
                              : inquiry?.status === 'contacted' ?'bg-blue-100 text-blue-800' :'bg-green-100 text-green-800'
                          }`}>
                            {inquiry?.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="MessageSquare" size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No inquiries yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandlordDashboard;