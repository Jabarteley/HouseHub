import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    savedProperties: 0,
    applications: 0,
    scheduledShowings: 0,
    inquiries: 0
  });

  const [savedProperties, setSavedProperties] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingShowings, setUpcomingShowings] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);

      // Load saved properties
      const { data: savedData, error: savedError } = await supabase?.from('saved_properties')?.select(`
          *,
          properties (
            id, title, price, property_type, address, city, state,
            property_images (image_url, is_primary)
          )
        `)?.eq('user_id', userProfile?.id)?.order('created_at', { ascending: false })?.limit(6);

      if (savedError) throw savedError;

      // Load applications
      const { data: applicationsData, error: applicationsError } = await supabase?.from('property_applications')?.select(`
          *,
          properties (title, address, city, state)
        `)?.eq('student_id', userProfile?.id)?.order('created_at', { ascending: false })?.limit(5);

      if (applicationsError) throw applicationsError;

      // Load upcoming showings
      const { data: showingsData, error: showingsError } = await supabase?.from('property_showings')?.select(`
          *,
          properties (title, address, city, state)
        `)?.eq('student_id', userProfile?.id)?.in('status', ['scheduled', 'confirmed'])?.gte('scheduled_date', new Date()?.toISOString())?.order('scheduled_date', { ascending: true })?.limit(5);

      if (showingsError) throw showingsError;

      // Load featured properties (for discovery)
      const { data: featuredData, error: featuredError } = await supabase?.from('properties')?.select(`
          id, title, price, property_type, address, city, state, bedrooms, bathrooms,
          property_images (image_url, is_primary)
        `)?.eq('status', 'active')?.eq('featured', true)?.order('created_at', { ascending: false })?.limit(6);

      if (featuredError) throw featuredError;

      // Count inquiries
      const { count: inquiriesCount } = await supabase?.from('property_inquiries')?.select('*', { count: 'exact', head: true })?.eq('student_id', userProfile?.id);

      setStats({
        savedProperties: savedData?.length || 0,
        applications: applicationsData?.length || 0,
        scheduledShowings: showingsData?.length || 0,
        inquiries: inquiriesCount || 0
      });

      setSavedProperties(savedData || []);
      setRecentApplications(applicationsData || []);
      setUpcomingShowings(showingsData || []);
      setFeaturedProperties(featuredData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedProperty = async (savedPropertyId) => {
    try {
      const { error } = await supabase?.from('saved_properties')?.delete()?.eq('id', savedPropertyId);

      if (error) throw error;

      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error removing saved property:', error);
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                  Student Dashboard
                </h1>
                <p className="text-text-secondary">
                  Welcome back, {userProfile?.full_name}. Find your perfect home.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  to="/property-listings"
                  className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction shadow-elevation-1 inline-block"
                >
                  <Icon name="Search" size={20} className="inline mr-2" />
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="Heart" size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Saved Properties</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.savedProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="FileText" size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Applications</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.applications}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon name="Calendar" size={24} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Scheduled Showings</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.scheduledShowings}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Icon name="MessageSquare" size={24} className="text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Inquiries Sent</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.inquiries}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Saved Properties */}
            <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Saved Properties</h2>
                  <Link
                    to="/user-profile-settings"
                    className="text-primary hover:text-primary-700 text-sm font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {savedProperties?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties?.slice(0, 3)?.map((saved) => (
                      <div key={saved?.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          {saved?.properties?.property_images?.find(img => img?.is_primary)?.image_url ? (
                            <img
                              src={saved?.properties?.property_images?.find(img => img?.is_primary)?.image_url}
                              alt={saved?.properties?.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <Icon name="Image" size={48} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-text-primary mb-1">
                            {saved?.properties?.title}
                          </h3>
                          <p className="text-sm text-text-secondary mb-2">
                            {saved?.properties?.address}, {saved?.properties?.city}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-text-primary">
                              ${saved?.properties?.price?.toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeSavedProperty(saved?.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Heart" size={48} className="mx-auto text-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">No saved properties</h3>
                    <p className="text-text-secondary mb-4">
                      Start browsing and save properties you are interested in.
                    </p>
                    <Link
                      to="/property-listings"
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors inline-block"
                    >
                      Browse Properties
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications & Upcoming Showings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Applications */}
              <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-text-primary">Recent Applications</h2>
                </div>
                <div className="p-6">
                  {recentApplications?.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications?.map((application) => (
                        <div key={application?.id} className="border border-border rounded p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                {application?.properties?.title}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {application?.properties?.address}, {application?.properties?.city}
                              </p>
                              <p className="text-xs text-text-secondary mt-1">
                                Applied on {new Date(application.created_at)?.toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              application?.status === 'pending' ?'bg-yellow-100 text-yellow-800'
                                : application?.status === 'approved' ?'bg-green-100 text-green-800' :'bg-red-100 text-red-800'
                            }`}>
                              {application?.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
                      <p className="text-text-secondary">No applications yet</p>
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
                      {upcomingShowings?.map((showing) => (
                        <div key={showing?.id} className="border border-border rounded p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                {showing?.properties?.title}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {showing?.properties?.address}, {showing?.properties?.city}
                              </p>
                              <p className="text-xs text-text-secondary mt-1">
                                {formatDateTime(showing?.scheduled_date)}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              showing?.status === 'scheduled' ?'bg-blue-100 text-blue-800'
                                : showing?.status === 'confirmed' ?'bg-green-100 text-green-800' :'bg-gray-100 text-gray-800'
                            }`}>
                              {showing?.status}
                            </span>
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

            {/* Featured Properties */}
            <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Featured Properties</h2>
                  <Link
                    to="/property-listings"
                    className="text-primary hover:text-primary-700 text-sm font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {featuredProperties?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProperties?.slice(0, 6)?.map((property) => (
                      <Link
                        key={property?.id}
                        to={`/property-details?id=${property?.id}`}
                        className="border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-shadow"
                      >
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          {property?.property_images?.find(img => img?.is_primary)?.image_url ? (
                            <img
                              src={property?.property_images?.find(img => img?.is_primary)?.image_url}
                              alt={property?.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <Icon name="Image" size={48} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-text-primary mb-1">
                            {property?.title}
                          </h3>
                          <p className="text-sm text-text-secondary mb-2">
                            {property?.address}, {property?.city}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-text-primary">
                              ${property?.price?.toLocaleString()}
                            </span>
                            <span className="text-sm text-text-secondary">
                              {property?.bedrooms} bed, {property?.bathrooms} bath
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No featured properties available</p>
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

export default StudentDashboard;