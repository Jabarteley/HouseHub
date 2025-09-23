import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const UserAccountMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Profile & Settings',
      path: '/user-profile-settings',
      icon: 'User',
      description: 'Manage your account and preferences'
    },
    {
      label: 'Saved Properties',
      path: '/saved-properties',
      icon: 'Heart',
      description: 'View your favorite listings'
    },
    {
      label: 'Search History',
      path: '/search-history',
      icon: 'Clock',
      description: 'Recent searches and alerts'
    },
    ...(user?.role === 'agent' ? [
      {
        label: 'My Listings',
        path: '/my-listings',
        icon: 'Building',
        description: 'Manage your property listings'
      },
      {
        label: 'Client Management',
        path: '/clients',
        icon: 'Users',
        description: 'View and manage clients'
      }
    ] : []),
    ...(user?.role === 'seller' ? [
      {
        label: 'My Properties',
        path: '/my-properties',
        icon: 'Building',
        description: 'Manage your listed properties'
      },
      {
        label: 'Listing Analytics',
        path: '/listing-analytics',
        icon: 'BarChart3',
        description: 'View property performance'
      }
    ] : []),
    {
      type: 'divider'
    },
    {
      label: 'Help & Support',
      path: '/support',
      icon: 'HelpCircle',
      description: 'Get help and contact support'
    },
    {
      label: 'Sign Out',
      action: 'logout',
      icon: 'LogOut',
      description: 'Sign out of your account'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef?.current && !menuRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleMenuAction = (item) => {
    if (item?.action === 'logout') {
      if (onLogout) {
        onLogout();
      } else {
        // Default logout behavior
        localStorage.removeItem('authToken');
        navigate('/');
      }
    } else if (item?.path) {
      navigate(item?.path);
    }
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user?.name?.split(' ')?.map(name => name?.[0])?.join('')?.toUpperCase()?.slice(0, 2);
  };

  const getRoleDisplayName = () => {
    const roleMap = {
      'buyer': 'Property Buyer',
      'seller': 'Property Seller',
      'agent': 'Real Estate Agent',
      'admin': 'Administrator'
    };
    return roleMap?.[user?.role] || 'User';
  };

  if (!user?.isAuthenticated) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          to="/login"
          className="text-sm font-medium text-text-secondary hover:text-text-primary 
                   transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium 
                   hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   transition-all duration-200 ease-out micro-interaction"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary-100 
                 transition-all duration-200 ease-out micro-interaction focus:outline-none
                 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        {/* User Avatar */}
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-8 h-8 bg-primary rounded-full flex items-center justify-center
                       ${user?.avatar ? 'hidden' : 'flex'}`}
          >
            <span className="text-sm font-medium text-white">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Online Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface"></div>
        </div>

        {/* User Info (Desktop) */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-text-primary leading-tight">
            {user?.name}
          </p>
          <p className="text-xs text-text-secondary leading-tight">
            {getRoleDisplayName()}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface rounded-lg shadow-elevation-4 
                      border border-border z-dropdown">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-10 h-10 bg-primary rounded-full flex items-center justify-center
                             ${user?.avatar ? 'hidden' : 'flex'}`}
                >
                  <span className="text-base font-medium text-white">
                    {getUserInitials()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.email}
                </p>
                <p className="text-xs text-accent font-medium">
                  {getRoleDisplayName()}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems?.map((item, index) => {
              if (item?.type === 'divider') {
                return (
                  <div key={index} className="my-2 border-t border-border"></div>
                );
              }

              return (
                <div key={item?.label}>
                  {item?.path ? (
                    <Link
                      to={item?.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start space-x-3 px-4 py-3 text-sm hover:bg-secondary-100 transition-colors duration-200 group"
                    >
                      <Icon 
                        name={item?.icon} 
                        size={18} 
                        className="text-text-secondary group-hover:text-text-primary transition-colors duration-200 mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-text-primary group-hover:text-text-primary">
                          {item?.label}
                        </p>
                        {item?.description && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            {item?.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleMenuAction(item)}
                      className="w-full flex items-start space-x-3 px-4 py-3 text-sm hover:bg-secondary-100 transition-colors duration-200 group"
                    >
                      <Icon 
                        name={item?.icon} 
                        size={18} 
                        className={`mt-0.5 transition-colors duration-200 ${
                          item?.action === 'logout' ?'text-error group-hover:text-error' :'text-text-secondary group-hover:text-text-primary'
                        }`}
                      />
                      <div className="flex-1 text-left">
                        <p className={`font-medium transition-colors duration-200 ${
                          item?.action === 'logout' ?'text-error' :'text-text-primary group-hover:text-text-primary'
                        }`}>
                          {item?.label}
                        </p>
                        {item?.description && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            {item?.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountMenu;