// src/pages/user-profile-settings/components/AccountSettings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AccountSettings = ({ user, onDataChange }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailPreferences, setEmailPreferences] = useState({
    listingAlerts: true,
    priceDrops: true,
    newListings: false,
    marketReports: true,
    promotions: false
  });
  const [notificationSettings, setNotificationSettings] = useState({
    showingConfirmations: true,
    messageNotifications: true,
    leadAlerts: user?.role === 'agent',
    marketingEmails: false,
    smsNotifications: true
  });

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e?.preventDefault();
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Simulate password change
    console.log('Password change submitted');
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onDataChange?.();
  };

  const handlePreferenceChange = (category, field, value) => {
    if (category === 'email') {
      setEmailPreferences(prev => ({ ...prev, [field]: value }));
    } else {
      setNotificationSettings(prev => ({ ...prev, [field]: value }));
    }
    onDataChange?.();
  };

  return (
    <div className="space-y-6">
      {/* Password Settings */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Password & Security
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your password and security settings
          </p>
        </div>

        <div className="p-6">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-text-primary">Password</h3>
                <p className="text-text-secondary text-sm">Last changed 3 months ago</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData?.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
                  className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData?.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
                  className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData?.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
                  className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* Email Preferences */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Email Preferences
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Choose what emails you'd like to receive
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {Object.entries({
              listingAlerts: 'New listing alerts in your saved searches',
              priceDrops: 'Price drop notifications on favorite properties',
              newListings: 'Weekly digest of new listings',
              marketReports: 'Monthly market reports and insights',
              promotions: 'Promotional offers and platform updates'
            })?.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor={key} className="text-sm font-medium text-text-primary">
                    {label}
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={key}
                    checked={emailPreferences?.[key]}
                    onChange={(e) => handlePreferenceChange('email', key, e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Notification Settings */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Notification Settings
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Control how you receive notifications
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {Object.entries({
              showingConfirmations: 'Showing confirmations and reminders',
              messageNotifications: 'New message notifications',
              ...(user?.role === 'agent' && { leadAlerts: 'New lead alerts and inquiries' }),
              marketingEmails: 'Marketing and promotional communications',
              smsNotifications: 'SMS text message notifications'
            })?.filter(([key]) => key !== undefined)?.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor={`notif-${key}`} className="text-sm font-medium text-text-primary">
                    {label}
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`notif-${key}`}
                    checked={notificationSettings?.[key]}
                    onChange={(e) => handlePreferenceChange('notification', key, e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-secondary-100 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-text-primary">Notification Frequency</h4>
                <p className="text-xs text-text-secondary mt-1">
                  You can set specific frequency settings for each type of notification in the advanced settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;