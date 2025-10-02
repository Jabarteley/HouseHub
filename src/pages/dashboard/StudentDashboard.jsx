import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import PropertySearch from './components/student/PropertySearch';
import MapView from './components/student/MapView';
import SavedProperties from './components/student/SavedProperties';
import RecentApplications from './components/student/RecentApplications';
import UpcomingShowings from './components/student/UpcomingShowings';
import StudentStats from './components/student/StudentStats';
import ScheduleShowingForm from './components/student/ScheduleShowingForm';
import PaymentFlow from './components/student/PaymentFlow';
import Messages from './components/student/Messages';
import Reviews from './components/student/Reviews';

const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showings, setShowings] = useState([]);
  const [stats, setStats] = useState({
    savedProperties: 0,
    applications: 0,
    scheduledShowings: 0,
    inquiries: 0
  });
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentProperty, setPaymentProperty] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch saved properties
      const { data: savedData, error: savedError } = await supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          properties (
            id,
            title,
            address,
            city,
            state,
            price,
            property_type,
            bedrooms,
            bathrooms,
            area_sqft,
            property_images (image_url, is_primary)
          )
        `)
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      // Fetch applications
      const { data: appData, error: appError } = await supabase
        .from('property_applications')
        .select(`
          id,
          property_id,
          status,
          created_at,
          properties (title)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (appError) throw appError;

      // Fetch showings for this student
      const { data: showingData, error: showingError } = await supabase
        .from('property_showings')
        .select(`
          id,
          property_id,
          scheduled_date,
          status,
          properties (title)
        `)
        .eq('student_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (showingError) throw showingError;

      setSavedProperties(savedData || []);
      setApplications(appData || []);
      setShowings(showingData || []);

      // Calculate stats
      setStats({
        savedProperties: savedData?.length || 0,
        applications: appData?.length || 0,
        scheduledShowings: showingData?.length || 0,
        inquiries: 0 // This would come from property_inquiries table
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.code === 'PGRST205') {
        console.warn('One or more tables not found. Please run the migration to create the required tables.');
        setSavedProperties([]);
        setApplications([]);
        setShowings([]);
      }
      // Set default values in case of error
      setStats({
        savedProperties: 0,
        applications: 0,
        scheduledShowings: 0,
        inquiries: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleShowing = (property) => {
    setSelectedProperty(property);
    setShowScheduleForm(true);
  };

  const handleShowingScheduled = () => {
    setShowScheduleForm(false);
    // Trigger a refresh of all components by updating the refresh trigger
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePropertySelect = (property) => {
    // Could show property details or navigate to property page
    console.log('Selected property:', property);
  };

  const handleMakePayment = (property, amount) => {
    setPaymentProperty(property);
    setPaymentAmount(amount);
    setShowPaymentFlow(true);
  };

  const handleRemoveSavedProperty = async (savedId) => {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedId);

      if (error) throw error;

      // Refresh saved properties
      fetchDashboardData();
    } catch (error) {
      console.error('Error removing saved property:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="h-20 bg-secondary-100 rounded-lg"></div>
                <div className="h-20 bg-secondary-100 rounded-lg"></div>
                <div className="h-20 bg-secondary-100 rounded-lg"></div>
                <div className="h-20 bg-secondary-100 rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
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
              Student Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back, {userProfile?.full_name || 'Student'}. Find your perfect property.
            </p>
          </div>

          {/* Stats */}
          <StudentStats stats={stats} key={`stats-${refreshTrigger}`} />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Search */}
              <PropertySearch key={`search-${refreshTrigger}`} onPropertySelect={handlePropertySelect} />
              
              {/* Map View */}
              <MapView key={`map-${refreshTrigger}`} onPropertySelect={handlePropertySelect} />
              
              {/* Saved Properties */}
              <SavedProperties 
                key={`saved-${refreshTrigger}`}
                properties={savedProperties} 
                onRemove={handleRemoveSavedProperty}
                onScheduleShowing={handleScheduleShowing}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Applications */}
              <RecentApplications key={`apps-${refreshTrigger}`} applications={applications} />
              
              {/* Upcoming Showings */}
              <UpcomingShowings key={`showings-${refreshTrigger}`} showings={showings} />
              
              {/* Messages */}
              <Messages key={`messages-${refreshTrigger}`} />
              
              {/* Reviews */}
              <Reviews key={`reviews-${refreshTrigger}`} />
            </div>
          </div>
        </div>
      </main>

      {/* Schedule Showing Form Modal */}
      {showScheduleForm && selectedProperty && (
        <ScheduleShowingForm
          property={selectedProperty}
          onClose={() => setShowScheduleForm(false)}
          onShowingScheduled={handleShowingScheduled}
        />
      )}

      {/* Payment Flow Modal */}
      {showPaymentFlow && paymentProperty && (
        <PaymentFlow
          propertyId={paymentProperty.id}
          propertyTitle={paymentProperty.title}
          amount={paymentAmount}
          type="deposit"
        />
      )}
    </div>
  );
};

export default StudentDashboard;