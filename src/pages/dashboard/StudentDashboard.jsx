import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PropertyListings from '../property-listings';
import Reviews from './components/student/Reviews';
import Wishlist from './components/student/Wishlist';
import Notifications from './components/student/Notifications';
import UpcomingShowings from './components/student/UpcomingShowings';
import RecentlyViewed from './components/student/RecentlyViewed';
import Icon from '../../components/AppIcon';

const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // browse, wishlist, reviews, notifications, showings, recently_viewed
  const [stats, setStats] = useState({
    propertiesViewed: 0,
    wishlistItems: 0,
    bookings: 0,
    reviews: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    try {
      setLoadingStats(true);

      // Get properties viewed count
      let { count: propertiesViewedCount } = await supabase
        .from('property_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get wishlist items count
      let { count: wishlistCount } = await supabase
        .from('property_wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get bookings count (property_showings)
      let { count: bookingsCount } = await supabase
        .from('property_showings')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      // Get reviews count
      let { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        propertiesViewed: propertiesViewedCount || 0,
        wishlistItems: wishlistCount || 0,
        bookings: bookingsCount || 0,
        reviews: reviewsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values if there's an error
      setStats({
        propertiesViewed: 0,
        wishlistItems: 0,
        bookings: 0,
        reviews: 0
      });
    } finally {
      setLoadingStats(false);
    }
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'browse':
        return <PropertyListings />;
      case 'wishlist':
        return <Wishlist />;
      case 'reviews':
        return <Reviews />;
      case 'notifications':
        return <Notifications />;
      case 'showings':
        return <UpcomingShowings />;
      case 'recently_viewed':
        return <RecentlyViewed />;
      default:
        return <PropertyListings />;
    }
  };

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
                  Browse properties, manage your wishlist, and track your applications
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8 border-b border-border">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'browse'
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                }`}
              >
                Browse Properties
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'wishlist'
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                }`}
              >
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('recently_viewed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'recently_viewed'
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                }`}
              >
                Recently Viewed
              </button>
              <button
                onClick={() => setActiveTab('showings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'showings'
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                }`}
              >
                My Showings
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                }`}
              >
                My Reviews
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-primary text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                }`}
              >
                Notifications
              </button>
            </nav>
          </div>

          {/* Dashboard Content */}
          <div className="mb-12">
            {renderActiveTab()}
          </div>

          {/* Quick Stats */}
          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-pulse">
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-secondary-100"></div>
                  </div>
                  <div className="ml-4">
                    <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-secondary-100"></div>
                  </div>
                  <div className="ml-4">
                    <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-secondary-100"></div>
                  </div>
                  <div className="ml-4">
                    <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-secondary-100"></div>
                  </div>
                  <div className="ml-4">
                    <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon name="Home" size={24} className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-secondary">Properties Viewed</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.propertiesViewed}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon name="Heart" size={24} className="text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-secondary">Wishlist Items</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.wishlistItems}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Icon name="Calendar" size={24} className="text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-secondary">Bookings</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.bookings}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Icon name="Star" size={24} className="text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-text-secondary">Reviews</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.reviews}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;