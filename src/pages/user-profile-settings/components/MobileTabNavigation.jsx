// src/pages/user-profile-settings/components/MobileTabNavigation.jsx
import React, { useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const MobileTabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  isMenuOpen, 
  onMenuToggle 
}) => {
  const activeTabData = tabs?.find(tab => tab?.id === activeTab);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef?.current && !menuRef?.current?.contains(event?.target) && isMenuOpen) {
        onMenuToggle();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, onMenuToggle]);

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Mobile Tab Selector Button */}
        <button
          onClick={onMenuToggle}
          className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-lg shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-label={`Current tab: ${activeTabData?.label}. Click to open menu.`}
        >
          <div className="flex items-center space-x-3">
            <Icon 
              name={activeTabData?.icon} 
              size={20} 
              className="text-primary" 
            />
            <span className="font-medium text-text-primary">
              {activeTabData?.label}
            </span>
          </div>
          <Icon 
            name="ChevronDown" 
            size={20} 
            className={`text-text-secondary transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Mobile Tab Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-elevation-4 z-mobile-menu max-h-80 overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="py-2">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => onTabChange(tab?.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus:bg-secondary-100 ${
                    activeTab === tab?.id
                      ? 'bg-primary-100 text-primary border-r-2 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                  }`}
                  aria-current={activeTab === tab?.id ? 'page' : undefined}
                >
                  <Icon 
                    name={tab?.icon} 
                    size={18} 
                    className={activeTab === tab?.id ? 'text-primary' : 'text-current'} 
                  />
                  <span className="font-medium">{tab?.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-modal lg:hidden"
          onClick={onMenuToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default MobileTabNavigation;