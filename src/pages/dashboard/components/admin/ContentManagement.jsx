import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const ContentManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [banners, setBanners] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });
  const [newBanner, setNewBanner] = useState({ title: '', content: '', link: '', is_active: true });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Since announcements and banners tables likely don't exist, let's initialize with empty arrays
      setAnnouncements([]);
      setBanners([]);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Please fill in all required fields');
      return;
    }

    // Since the announcements table doesn't exist, we'll simulate adding an announcement
    const newAnnouncementObj = {
      id: Date.now(), // Use timestamp as ID for demo
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      created_at: new Date().toISOString()
    };

    setAnnouncements([newAnnouncementObj, ...announcements]);
    setNewAnnouncement({ title: '', content: '', priority: 'normal' });

    // Show a message to indicate this is simulated functionality
    alert('This is simulated functionality. In a real application, this would be saved to the database.');
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.content) {
      alert('Please fill in all required fields');
      return;
    }

    // Since the banners table doesn't exist, we'll simulate adding a banner
    const newBannerObj = {
      id: Date.now(), // Use timestamp as ID for demo
      title: newBanner.title,
      content: newBanner.content,
      link: newBanner.link,
      is_active: newBanner.is_active,
      created_at: new Date().toISOString()
    };

    setBanners([newBannerObj, ...banners]);
    setNewBanner({ title: '', content: '', link: '', is_active: true });

    // Show a message to indicate this is simulated functionality
    alert('This is simulated functionality. In a real application, this would be saved to the database.');
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    // Delete from in-memory state since no database table exists
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }
    
    // Delete from in-memory state since no database table exists
    setBanners(banners.filter(banner => banner.id !== id));
  };

  const handleToggleBanner = async (id, currentStatus) => {
    // Update in-memory state since no database table exists
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, is_active: !currentStatus } : banner
    ));
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Content Management</h2>
        <div className="mt-2 md:mt-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === 'announcements' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === 'banners' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Banners
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'announcements' && (
        <div>
          <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
            <h3 className="font-medium text-text-primary mb-3">Add New Announcement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">Content</label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary h-24"
                placeholder="Announcement content"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={handleAddAnnouncement}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Add Announcement
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {announcements.map(announcement => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">{announcement.title}</div>
                      <div className="text-sm text-text-secondary mt-1">{announcement.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${announcement.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : announcement.priority === 'normal'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'}`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div>
          <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
            <h3 className="font-medium text-text-primary mb-3">Add New Banner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                  placeholder="Banner title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Link (optional)</label>
                <input
                  type="text"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">Content</label>
              <textarea
                value={newBanner.content}
                onChange={(e) => setNewBanner({...newBanner, content: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary h-24"
                placeholder="Banner content"
              />
            </div>
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={newBanner.is_active}
                onChange={(e) => setNewBanner({...newBanner, is_active: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-text-secondary">Active Banner</label>
            </div>
            <div className="mt-3">
              <button
                onClick={handleAddBanner}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Add Banner
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {banners.map(banner => (
                  <tr key={banner.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">{banner.title}</div>
                      {banner.link && (
                        <div className="text-sm text-blue-600 mt-1">{banner.link}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{banner.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleBanner(banner.id, banner.is_active)}
                        className={`px-3 py-1 rounded text-xs ${
                          banner.is_active 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {banner.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;