// src/pages/user-profile-settings/components/PrivacyControls.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PrivacyControls = ({ user, onDataChange }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // 'public', 'agents-only', 'private'
    showContactInfo: true,
    showListingHistory: user?.role === 'agent',
    allowDirectContact: true,
    showInSearchResults: true,
    shareDataWithPartners: false,
    allowMarketingEmails: false,
    showOnlineStatus: true,
    allowPropertyRecommendations: true,
    publicProfileUrl: `https://estatehub.com/agent/${user?.id || 'user123'}`,
    customProfileUrl: '',
    blockList: []
  });

  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [newBlockedUser, setNewBlockedUser] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSettingChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    onDataChange?.();
  };

  const handleBlockUser = () => {
    if (newBlockedUser?.trim()) {
      setPrivacySettings(prev => ({
        ...prev,
        blockList: [...prev?.blockList, {
          id: Date.now()?.toString(),
          email: newBlockedUser?.trim(),
          dateBlocked: new Date()?.toISOString()?.split('T')?.[0]
        }]
      }));
      setNewBlockedUser('');
      setShowBlockUserModal(false);
      onDataChange?.();
    }
  };

  const handleUnblockUser = (userId) => {
    setPrivacySettings(prev => ({
      ...prev,
      blockList: prev?.blockList?.filter(user => user?.id !== userId)
    }));
    onDataChange?.();
  };

  const handleDeleteAccount = () => {
    // This would typically trigger an API call to initiate account deletion
    console.log('Account deletion initiated');
    setShowDeleteModal(false);
  };

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Your profile is visible to everyone'
    },
    {
      value: 'agents-only',
      label: 'Agents Only',
      description: 'Only visible to verified real estate agents'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can see your profile information'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Profile Visibility
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Control who can see your profile information
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {visibilityOptions?.map((option) => (
              <label key={option?.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option?.value}
                  checked={privacySettings?.profileVisibility === option?.value}
                  onChange={(e) => handleSettingChange('profileVisibility', e?.target?.value)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{option?.label}</div>
                  <div className="text-sm text-text-secondary">{option?.description}</div>
                </div>
              </label>
            ))}
          </div>

          {privacySettings?.profileVisibility === 'public' && (
            <div className="mt-6 p-4 bg-primary-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="Globe" size={20} className="text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Public Profile URL</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Your profile is accessible at: 
                    <a href={privacySettings?.publicProfileUrl} className="text-primary hover:underline ml-1">
                      {privacySettings?.publicProfileUrl}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Contact Preferences */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Contact Preferences
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage how others can contact you
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                key: 'showContactInfo',
                label: 'Show contact information on profile',
                description: 'Display your email and phone number publicly'
              },
              {
                key: 'allowDirectContact',
                label: 'Allow direct contact through platform',
                description: 'Other users can send you messages through the platform'
              },
              {
                key: 'showOnlineStatus',
                label: 'Show online status',
                description: 'Display when you are currently active on the platform'
              }
            ]?.map((setting) => (
              <div key={setting?.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor={setting?.key} className="text-sm font-medium text-text-primary">
                    {setting?.label}
                  </label>
                  <p className="text-xs text-text-secondary mt-1">{setting?.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={setting?.key}
                    checked={privacySettings?.[setting?.key]}
                    onChange={(e) => handleSettingChange(setting?.key, e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Data & Privacy */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Data & Privacy
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Control how your data is used and shared
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                key: 'showInSearchResults',
                label: 'Appear in search results',
                description: 'Allow your profile to be found in agent/user searches'
              },
              {
                key: 'allowPropertyRecommendations',
                label: 'Receive personalized property recommendations',
                description: 'Use your activity to suggest relevant properties'
              },
              {
                key: 'shareDataWithPartners',
                label: 'Share data with trusted partners',
                description: 'Allow sharing of anonymized data with real estate partners'
              },
              {
                key: 'allowMarketingEmails',
                label: 'Marketing communications',
                description: 'Receive promotional emails and platform updates'
              }
            ]?.map((setting) => (
              <div key={setting?.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor={setting?.key} className="text-sm font-medium text-text-primary">
                    {setting?.label}
                  </label>
                  <p className="text-xs text-text-secondary mt-1">{setting?.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={setting?.key}
                    checked={privacySettings?.[setting?.key]}
                    onChange={(e) => handleSettingChange(setting?.key, e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Blocked Users */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary font-heading">
                Blocked Users
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Manage users who cannot contact you
              </p>
            </div>
            <button
              onClick={() => setShowBlockUserModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              Block User
            </button>
          </div>
        </div>

        <div className="p-6">
          {privacySettings?.blockList?.length === 0 ? (
            <div className="text-center py-6">
              <Icon name="Shield" size={48} className="text-secondary-300 mx-auto mb-4" />
              <p className="text-text-secondary">No blocked users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {privacySettings?.blockList?.map((blockedUser) => (
                <div key={blockedUser?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{blockedUser?.email}</p>
                    <p className="text-xs text-text-secondary">Blocked on {blockedUser?.dateBlocked}</p>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(blockedUser?.id)}
                    className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Account Deletion */}
      <div className="bg-surface rounded-lg shadow-elevation-1 border-error">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-error font-heading">
            Danger Zone
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Irreversible actions that affect your account
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-4">
            <Icon name="AlertTriangle" size={24} className="text-error mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-text-primary mb-2">Delete Account</h3>
              <p className="text-text-secondary text-sm mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-error text-white px-4 py-2 rounded-md font-medium hover:bg-error-600 transition-colors duration-200"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Block User Modal */}
      {showBlockUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Block User</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="blockUserEmail" className="block text-sm font-medium text-text-primary mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  id="blockUserEmail"
                  value={newBlockedUser}
                  onChange={(e) => setNewBlockedUser(e?.target?.value)}
                  placeholder="user@example.com"
                  className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
              
              <p className="text-sm text-text-secondary">
                Blocked users won't be able to contact you or see your profile.
              </p>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBlockUser}
                className="flex-1 bg-error text-white px-4 py-2 rounded-md font-medium hover:bg-error-600 transition-colors duration-200"
              >
                Block User
              </button>
              <button
                onClick={() => {
                  setShowBlockUserModal(false);
                  setNewBlockedUser('');
                }}
                className="flex-1 border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-error" />
              <h3 className="text-lg font-semibold text-text-primary">Delete Account</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-text-secondary">
                Are you absolutely sure you want to delete your account? This will:
              </p>
              
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Permanently delete all your profile information</li>
                <li>Remove all saved searches and favorite properties</li>
                <li>Cancel any active subscriptions</li>
                <li>Delete all message history</li>
              </ul>
              
              <div className="p-3 bg-error-100 rounded-lg">
                <p className="text-sm text-error font-medium">
                  This action cannot be undone!
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-error text-white px-4 py-2 rounded-md font-medium hover:bg-error-600 transition-colors duration-200"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyControls;