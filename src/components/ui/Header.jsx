import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const { user, userProfile, signOut, isAuthenticated, loading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const navigationItems = [
    {
      label: 'Search Properties',
      path: '/property-listings',
      icon: 'Search',
      roles: ['all']
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['admin', 'landlord', 'agent', 'student']
    }
  ];

  const userMenuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      label: 'Profile & Settings',
      path: '/user-profile-settings',
      icon: 'User'
    },
    {
      label: 'Saved Properties',
      path: '/user-profile-settings',
      icon: 'Heart'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef?.current && !mobileMenuRef?.current?.contains(event?.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location?.pathname]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      navigate(`/property-listings?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const shouldShowNavItem = (roles) => {
    if (roles?.includes('all')) return true;
    if (!isAuthenticated) return false;
    return roles?.includes(userProfile?.role);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-2 micro-interaction"
              aria-label="EstateHub - Go to homepage"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Icon name="Home" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary font-heading">
                HouseHub
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon 
                    name="Search" 
                    size={20} 
                    className={`transition-colors duration-200 ${
                      isSearchFocused ? 'text-primary' : 'text-secondary'
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search properties by location, type, or price..."
                  className="block w-full pl-10 pr-4 py-2 border border-border rounded-md 
                           focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                           transition-all duration-200 ease-out bg-background text-text-primary
                           placeholder-text-secondary"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems?.map((item) => (
              shouldShowNavItem(item?.roles) && (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium 
                           transition-all duration-200 ease-out micro-interaction
                           ${isActiveRoute(item?.path)
                             ? 'bg-primary-100 text-primary border border-primary-500' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                           }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                </Link>
              )
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-md transition-all duration-200 micro-interaction"
              aria-label="Toggle dark mode"
            >
              <Icon name={darkMode ? "Sun" : "Moon"} size={20} />
            </button>

            {/* User Menu & Mobile Menu Button */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary-100 transition-all duration-200 ease-out micro-interaction"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {userProfile?.full_name?.split(' ')?.map(n => n?.[0])?.join('') || 
                       user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`hidden sm:block transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-md shadow-elevation-3 
                                border border-border z-dropdown">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">
                        {userProfile?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-text-secondary capitalize">
                        {userProfile?.role || 'User'}
                      </p>
                    </div>
                    <div className="py-1">
                      {userMenuItems?.map((item) => (
                        <Link
                          key={item?.label}
                          to={item?.path}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
                        >
                          <Icon name={item?.icon} size={16} />
                          <span>{item?.label}</span>
                        </Link>
                      ))}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/auth/login"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary 
                             transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium 
                             hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-all duration-200 ease-out"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Search" size={20} className="text-secondary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                placeholder="Search properties..."
                className="block w-full pl-10 pr-4 py-2 border border-border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary"
              />
            </div>
          </form>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden bg-surface border-t border-border z-mobile-menu"
        >
          <div className="px-4 py-3 space-y-1">
            {navigationItems?.map((item) => (
              shouldShowNavItem(item?.roles) && (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium 
                           transition-all duration-200 ease-out
                           ${isActiveRoute(item?.path)
                             ? 'bg-primary-100 text-primary border border-primary-500' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                           }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </Link>
              )
            ))}

            {/* Mobile Auth Section */}
            {isAuthenticated && user ? (
              <div className="border-t border-border pt-3 mt-3">
                {userMenuItems?.map((item) => (
                  <Link
                    key={item?.label}
                    to={item?.path}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-all duration-200 ease-out"
                  >
                    <Icon name={item?.icon} size={20} />
                    <span>{item?.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-all duration-200 ease-out"
                >
                  <Icon name="LogOut" size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              !loading && (
                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-md transition-all duration-200 ease-out"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="block bg-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-all duration-200 ease-out"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;