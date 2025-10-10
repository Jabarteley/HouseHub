import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import PropertyForm from './components/landlord/AddPropertyForm';
import PropertyImageUpload from './components/landlord/PropertyImageUpload';
import LandlordStats from './components/landlord/LandlordStats';
import PropertyList from './components/landlord/PropertyList';
import RecentInquiries from './components/landlord/RecentInquiries';
import BookingRequests from './components/landlord/BookingRequests';
import Earnings from './components/landlord/Earnings';
import LeaseTemplates from './components/landlord/LeaseTemplates';
import AgentRequests from './components/landlord/AgentRequests';
import PropertyAgentManagement from './components/landlord/PropertyAgentManagement';
import UnitManagement from './components/landlord/UnitManagement';

const LandlordDashboard = () => {
  const { user, userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalInquiries: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch properties owned by the current user
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*, property_images(image_url, is_primary)')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch inquiries for landlord's properties
      if (propertiesData && propertiesData.length > 0) {
        const propertyIds = propertiesData.map(p => p.id);
        const { data: inquiriesData, error: inquiriesError } = await supabase
          .from('property_inquiries')
          .select(`
            id,
            property_id,
            student_id,
            message,
            status,
            created_at,
            properties (title)
          `)
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });

        if (inquiriesError) {
          if (inquiriesError.code === 'PGRST205') {
            // Table doesn't exist - show empty state
            console.warn('Property inquiries table not found. Please run the migration to create the required tables.');
            setInquiries([]);
          } else {
            throw inquiriesError;
          }
        } else {
          // For user profile data, we'll fetch separately to avoid join issues
          const studentIds = [...new Set(inquiriesData.map(i => i.student_id))];
          let userProfiles = [];
          
          if (studentIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('user_profiles')
              .select('id, full_name')
              .in('id', studentIds);
              
            if (!profilesError) {
              userProfiles = profiles || [];
            }
          }
          
          // Combine inquiries with user profile data
          const inquiriesWithProfiles = inquiriesData.map(inquiry => ({
            ...inquiry,
            user_profiles: userProfiles.find(up => up.id === inquiry.student_id)
          }));
          
          setInquiries(inquiriesWithProfiles);
        }
      } else {
        setInquiries([]);
      }

      setProperties(propertiesData || []);

      // Calculate stats
      if (propertiesData) {
        const totalProperties = propertiesData.length;
        const activeListings = propertiesData.filter(p => p.status === 'active').length;
        const totalInquiries = inquiries.length;

        // Calculate monthly revenue from transactions if available
        let monthlyRevenue = 0;
        try {
          // Try to get transactions for potential revenue calculation
          const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('amount, created_at')
            .eq('payment_status', 'completed');

          if (transactionsError) {
            if (transactionsError.code !== 'PGRST205') { // Table doesn't exist error
              console.warn('Could not fetch transactions for revenue calculation:', transactionsError.message);
            }
          } else if (transactions) {
            const now = new Date();
            monthlyRevenue = transactions
              .filter(t => {
                const date = new Date(t.created_at);
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              })
              .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
          }
        } catch (error) {
          console.warn('Could not calculate monthly revenue:', error.message);
        }

        setStats({
          totalProperties,
          activeListings,
          totalInquiries,
          monthlyRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAdded = () => {
    fetchDashboardData();
    setShowAddPropertyForm(false);
  };

  const handlePropertyUpdated = () => {
    fetchDashboardData();
    setSelectedProperty(null);
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId)
        .eq('landlord_id', user.id);

      if (error) throw error;

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)
          .eq('landlord_id', user.id);

        if (error) throw error;

        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-100 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="h-20 bg-secondary-100 rounded-lg"></div>
              <div className="h-20 bg-secondary-100 rounded-lg"></div>
              <div className="h-20 bg-secondary-100 rounded-lg"></div>
              <div className="h-20 bg-secondary-100 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold leading-tight">Landlord Dashboard</h1>
          <p className="mt-3 text-lg text-text-secondary">
            Welcome back, {userProfile?.full_name || 'Landlord'}. Manage your properties and earnings.
          </p>
        </div>

        <LandlordStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - Properties and Images */}
          <div className="lg:col-span-2 space-y-10">
            <PropertyList 
              properties={properties} 
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteProperty}
              onEdit={(property) => {
                setSelectedProperty(property);
                setShowAddPropertyForm(true);
              }}
              onManageUnits={(property) => {
                setSelectedProperty(property);
              }}
            />
            
            {selectedProperty && (
              <PropertyImageUpload 
                propertyId={selectedProperty.id} 
                onImagesUploaded={fetchDashboardData}
              />
            )}
            
            {/* Show Unit Management for multi-unit properties */}
            {selectedProperty && selectedProperty.total_units && selectedProperty.total_units > 1 && (
              <UnitManagement propertyId={selectedProperty.id} />
            )}
            
            {/* Agent Requests Section */}
            <AgentRequests />
          </div>

          {/* Right column - Inquiries, Bookings, Earnings, etc. */}
          <div className="space-y-10">
            <RecentInquiries inquiries={inquiries} />
            <PropertyAgentManagement />
            <BookingRequests />
            <Earnings />
            <LeaseTemplates />
            
            <button
              onClick={() => setShowAddPropertyForm(true)}
              className="w-full py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-elevation-1"
            >
              Add New Property
            </button>
          </div>
        </div>
      </main>

      {showAddPropertyForm && (
        <PropertyForm
          property={selectedProperty}
          onClose={() => {
            setShowAddPropertyForm(false);
            setSelectedProperty(null);
          }}
          onPropertyAdded={handlePropertyAdded}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </div>
  );
};

export default LandlordDashboard;