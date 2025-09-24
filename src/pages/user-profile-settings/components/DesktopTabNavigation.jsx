// src/pages/user-profile-settings/components/DesktopTabNavigation.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const DesktopTabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="sticky top-20 lg:top-22 bg-surface rounded-lg shadow-elevation-1 overflow-hidden z-10">
      <nav className="space-y-1 p-2">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left font-medium transition-all duration-200 micro-interaction focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              activeTab === tab?.id
                ? 'bg-primary-100 text-primary border border-primary-500' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
            }`}
          >
            <Icon 
              name={tab?.icon} 
              size={20} 
              className={activeTab === tab?.id ? 'text-primary' : 'text-current'} 
            />
            <span className="truncate">{tab?.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DesktopTabNavigation;