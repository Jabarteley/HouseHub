// src/pages/user-profile-settings/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ProfileInformation from './components/ProfileInformation';
import AccountSettings from './components/AccountSettings';
import SavedSearches from './components/SavedSearches';
import FavoriteProperties from './components/FavoriteProperties';
import BusinessProfile from './components/BusinessProfile';
import PrivacyControls from './components/PrivacyControls';
import PaymentMethods from './components/PaymentMethods';
import ActivityHistory from './components/ActivityHistory';
import MobileTabNavigation from './components/MobileTabNavigation';
import DesktopTabNavigation from './components/DesktopTabNavigation';

const UserProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'

  // Mock user data - in real app this would come from context/state management
  const [user] = useState({
    id: '123',
    role: 'agent', // 'buyer', 'seller', 'agent'
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '/assets/images/profile_default.png',
    bio: 'Experienced real estate agent with 10+ years in luxury properties.',
    isVerified: true
  });

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      component: ProfileInformation,
      roles: ['all']
    },
    {
      id: 'account',
      label: 'Account Settings',
      icon: 'Settings',
      component: AccountSettings,
      roles: ['all']
    },
    {
      id: 'searches',
      label: 'Saved Searches',
      icon: 'Search',
      component: SavedSearches,
      roles: ['buyer']
    },
    {
      id: 'favorites',
      label: 'Favorite Properties',
      icon: 'Heart',
      component: FavoriteProperties,
      roles: ['buyer', 'seller']
    },
    {
      id: 'business',
      label: 'Business Profile',
      icon: 'Building2',
      component: BusinessProfile,
      roles: ['agent']
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: 'Shield',
      component: PrivacyControls,
      roles: ['all']
    },
    {
      id: 'payments',
      label: 'Payment Methods',
      icon: 'CreditCard',
      component: PaymentMethods,
      roles: ['agent']
    },
    {
      id: 'activity',
      label: 'Activity History',
      icon: 'Clock',
      component: ActivityHistory,
      roles: ['all']
    }
  ];

  const filteredTabs = tabs?.filter(tab => 
    tab?.roles?.includes('all') || tab?.roles?.includes(user?.role)
  );

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-save functionality
    if (hasUnsavedChanges) {
      setAutoSaveStatus('saving');
      const saveTimer = setTimeout(() => {
        // Simulate API call
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges]);

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave this section?')) {
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
        setIsMobileMenuOpen(false);
      }
    } else {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
    }
  };

  const handleDataChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      profile: user,
      exportDate: new Date()?.toISOString(),
      dataType: 'personal_data'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-data-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ActiveTabComponent = filteredTabs?.find(tab => tab?.id === activeTab)?.component;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4 skeleton"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2 skeleton"></div>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1">
                <div className="space-y-2">
                  {[...Array(6)]?.map((_, i) => (
                    <div key={i} className="h-12 bg-secondary-100 rounded skeleton"></div>
                  ))}
                </div>
              </div>
              
              {/* Main Content Skeleton */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="h-64 bg-secondary-100 rounded-lg skeleton"></div>
                  <div className="h-48 bg-secondary-100 rounded-lg skeleton"></div>
                  <div className="h-32 bg-secondary-100 rounded-lg skeleton"></div>
                </div>
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
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                  Profile & Settings
                </h1>
                <p className="text-text-secondary">
                  Manage your account information and preferences
                </p>
              </div>
              
              {/* Auto-save Status & Export */}
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                {/* Auto-save Status */}
                <div className="flex items-center space-x-2 text-sm">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-text-secondary">Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-success">Saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <div className="w-4 h-4 bg-error rounded-full"></div>
                      <span className="text-error">Save failed</span>
                    </>
                  )}
                </div>
                
                {/* Export Button */}
                <button
                  onClick={handleExportData}
                  className="text-sm font-medium text-primary hover:text-primary-700 transition-colors duration-200"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mb-6">
            <MobileTabNavigation
              tabs={filteredTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isMenuOpen={isMobileMenuOpen}
              onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>

          {/* Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="lg:sticky lg:top-20 lg:max-h-screen lg:overflow-y-auto lg:pb-20">
                <DesktopTabNavigation
                  tabs={filteredTabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="min-h-screen lg:min-h-0">
                {ActiveTabComponent && (
                  <ActiveTabComponent
                    user={user}
                    onDataChange={handleDataChange}
                    hasUnsavedChanges={hasUnsavedChanges}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfileSettings;