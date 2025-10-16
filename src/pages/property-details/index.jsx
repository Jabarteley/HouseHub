// src/pages/property-details/index.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Import components
import ImageGallery from './components/ImageGallery';
import PropertyOverview from './components/PropertyOverview';
import PropertyTabs from './components/PropertyTabs';
import ContactForm from './components/ContactForm';
import SimilarProperties from './components/SimilarProperties';
import LoadingState from './components/LoadingState';
import UnitsList from './components/UnitsList';
import BookingModal from './components/BookingModal';
import UserBookingStatus from './components/UserBookingStatus';

const PropertyDetails = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedUnitBooking, setSelectedUnitBooking] = useState(null);

  const propertyId = searchParams?.get('id');
  // Check if property is multi-unit from the property data itself
  const isMultiUnit = property && property.totalUnits > 1;

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
      trackPropertyView();
    }
  }, [propertyId, user]);

  const trackPropertyView = async () => {
    if (!user || !propertyId) return;

    try {
      // Try to insert a record in property_views table
      const { error } = await supabase
        .from('property_views')
        .upsert(
          {
            user_id: user.id,
            property_id: propertyId,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,property_id', ignoreDuplicates: true }
        );

      if (error) {
        // If there's an error, it might be because the record already exists (due to unique constraint)
        // That's okay, we don't need to track multiple views
        if (error.code !== '23505') { // 23505 is the unique violation error code
          console.error('Error tracking property view:', error);
        }
      }
    } catch (error) {
      console.error('Error in trackPropertyView:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          price_range,
          address,
          city,
          state,
          bedrooms,
          bathrooms,
          area_sqft,
          property_type,
          property_subtype,
          year_built,
          lot_size,
          parking_spaces,
          description,
          amenities,
          days_on_market,
          mls,
          created_at,
          total_units,
          available_units,
          landlord_id,
          agent_id,
          property_images!inner (id, image_url, is_primary),
          agent:user_profiles!properties_agent_id_fkey (id, full_name, avatar_url),
          landlord:user_profiles!properties_landlord_id_fkey (id, full_name, avatar_url)
        `)
        .eq('id', propertyId)
        .eq('status', 'active')
        .single();

      if (propertyError) throw propertyError;

      // Check if user has saved this property
      let isPropertySaved = false;
      if (user) {
        const { data: savedData, error: savedError } = await supabase
          .from('saved_properties')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .maybeSingle();

        isPropertySaved = !savedError && savedData?.id ? true : false;
      }

      // Format the property data to match the component expectations
      const formattedProperty = {
        id: propertyData.id,
        title: propertyData.title,
        price: propertyData.price,
        priceRange: propertyData.price_range,
        address: `${propertyData.address}, ${propertyData.city}, ${propertyData.state}`,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        sqft: propertyData.area_sqft,
        propertyType: propertyData.property_type,
        propertySubtype: propertyData.property_subtype,
        yearBuilt: propertyData.year_built,
        lotSize: propertyData.lot_size,
        parkingSpaces: propertyData.parking_spaces,
        description: propertyData.description,
        amenities: propertyData.amenities ? (Array.isArray(propertyData.amenities) ? propertyData.amenities : [propertyData.amenities]) : [],
        daysOnMarket: propertyData.days_on_market || Math.floor((new Date() - new Date(propertyData.created_at)) / (1000 * 60 * 60 * 24)),
        mls: propertyData.mls,
        totalUnits: propertyData.total_units,
        availableUnits: propertyData.available_units,
        coordinates: propertyData.latitude && propertyData.longitude ? 
          { lat: propertyData.latitude, lng: propertyData.longitude } : null,
        images: propertyData.property_images?.map(img => img.image_url) || [],
        agent: propertyData.agent ? {
          name: propertyData.agent.full_name,
          avatar: propertyData.agent.avatar_url
        } : null,
        landlord: propertyData.landlord ? {
          name: propertyData.landlord.full_name,
          avatar: propertyData.landlord.avatar_url
        } : null
      };

      setProperty(formattedProperty);
      setIsSaved(isPropertySaved);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  // If still loading or no property found, show loading state
  if (loading) {
    return <LoadingState />;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary">Property Not Found</h1>
              <p className="text-text-secondary mt-2">The property you're looking for doesn't exist or is no longer available.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Function to handle saving/un-saving property
  const toggleSaveProperty = async () => {
    if (!user) {
      alert('Please log in to save properties.');
      return;
    }

    if (isSaved) {
      // Remove from saved
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .match({ user_id: user.id, property_id: property.id });

      if (!error) {
        setIsSaved(false);
      }
    } else {
      // Add to saved
      const { error } = await supabase
        .from('saved_properties')
        .insert([{ user_id: user.id, property_id: property.id }]);

      if (!error) {
        setIsSaved(true);
      }
    }
  };

  const handleSave = () => {
    toggleSaveProperty();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBookUnit = (unit) => {
    if (!user) {
      alert('Please log in to book a unit.');
      return;
    }
    setSelectedUnit(unit);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      // Create a booking record
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          unit_id: bookingData.unitId,
          client_id: user.id,
          status: 'Pending',
          booking_date: new Date().toISOString().split('T')[0],
          duration: parseInt(bookingData.duration),
          start_date: bookingData.startDate,
          message: bookingData.message,
          amount: bookingData.unitPrice
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Booking request submitted successfully! The landlord will review your request.');
      setShowBookingModal(false);
      setSelectedUnit(null);
      
      // Refresh the property data to update unit availability
      fetchProperty();
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Error submitting booking. Please try again.');
    }
  };

  // Breadcrumbs
  const getBreadcrumbs = () => {
    return [
      { label: 'Home', path: '/' },
      { label: 'Properties', path: '/property-listings' },
      { label: property?.title, path: null }
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-18">
        {/* Breadcrumb */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              {getBreadcrumbs()?.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <Icon name="ChevronRight" size={14} className="text-text-secondary" />
                  )}
                  {crumb?.path ? (
                    <Link
                      to={crumb?.path}
                      className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                    >
                      {crumb?.label}
                    </Link>
                  ) : (
                    <span className="text-text-primary font-medium">{crumb?.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Actions Bar */}
        <div className="lg:hidden bg-surface border-b border-border sticky top-16 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className={`p-2 rounded-md transition-all duration-200 ${
                  isSaved 
                    ? 'bg-error text-white' :'bg-secondary-100 text-text-secondary hover:bg-error hover:text-white'
                }`}
              >
                <Icon name="Heart" size={18} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-all duration-200"
              >
                <Icon name="Share" size={18} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {isMultiUnit && property?.total_units > 1 ? (
                <>
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Please log in to view available units.');
                        return;
                      }
                      setActiveTab('units');
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200"
                  >
                    View Units
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-600 transition-all duration-200"
                  >
                    Contact Agent
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200">
                    Schedule Tour
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery 
                images={property?.images}
                title={property?.title}
              />

              {/* Property Overview */}
              <PropertyOverview 
                property={property}
                isSaved={isSaved}
                onSave={handleSave}
                onShare={handleShare}
                onContact={() => setShowContactForm(true)}
              />

              {/* Show booking status for authenticated users */}
              {user && (
                <UserBookingStatus propertyId={property?.id} />
              )}

              {/* For multi-unit properties, show unit list instead of property tabs */}
              {isMultiUnit && property?.total_units > 1 ? (
                <div className="card p-6">
                  <UnitsList 
                    propertyId={property?.id} 
                    onBookUnit={handleBookUnit}
                  />
                </div>
              ) : (
                <>
                  {/* Property Tabs for single units */}
                  <PropertyTabs 
                    property={property}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Property Summary Card - Enhanced for multi-unit properties */}
              <div className="card p-6">
                <h3 className="font-semibold text-text-primary mb-4">
                  {isMultiUnit ? 'Unit Pricing' : 'Property Pricing'}
                </h3>
                
                {isMultiUnit ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Price Range:</span>
                      <span className="font-medium">{property?.priceRange || `${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(property?.price)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Units Available:</span>
                      <span className="font-medium">{property?.availableUnits} of {property?.totalUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Property Type:</span>
                      <span className="font-medium">{property?.propertySubtype || property?.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Booking Type:</span>
                      <span className="font-medium text-success-600">Unit Booking Available</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-medium">{new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(property?.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Property Type:</span>
                      <span className="font-medium">{property?.propertyType}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  {isMultiUnit && property?.total_units > 1 ? (
                    <button
                      onClick={() => {
                        if (!user) {
                          alert('Please log in to view available units.');
                          return;
                        }
                        setActiveTab('units');
                      }}
                      className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
                    >
                      View Available Units
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
                    >
                      Contact Agent
                    </button>
                  )}
                  <button className="w-full bg-accent text-white py-3 rounded-md hover:bg-accent-600 transition-all duration-200">
                    Schedule Tour
                  </button>
                </div>
              </div>

              {/* Agent Contact Card */}
              <div className="card p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src={property?.agent?.avatar || '/assets/Images/profile_default.png'}
                    alt={property?.agent?.name || 'Agent'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{property?.agent?.name || 'Agent'}</h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
                  >
                    <Icon name="MessageCircle" size={16} />
                    <span>Send Message</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center space-x-2 bg-accent-100 text-accent-600 py-2 rounded-md hover:bg-accent hover:text-white transition-all duration-200">
                      <Icon name="Phone" size={16} />
                      <span className="text-sm">Call</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-secondary-100 text-text-secondary py-2 rounded-md hover:bg-secondary-200 transition-all duration-200">
                      <Icon name="Calendar" size={16} />
                      <span className="text-sm">Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="mt-12">
            <SimilarProperties propertyId={property?.id} />
          </div>

          {/* Booking Modal */}
          {selectedUnit && (
            <BookingModal
              unit={selectedUnit}
              property={property}
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              onSubmit={handleBookingSubmit}
            />
          )}
        </div>
      </main>
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          property={property}
          agent={property?.agent}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetails;