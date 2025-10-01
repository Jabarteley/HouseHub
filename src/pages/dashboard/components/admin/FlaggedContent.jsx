import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const FlaggedContent = () => {
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchFlaggedItems();
  }, [activeTab]);

  const fetchFlaggedItems = async () => {
    try {
      setLoading(true);
      
      // First, get the flagged items
      let query = supabase
        .from('flags')
        .select(`
          *,
          reporter: user_profiles!reporter_id (full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data: flags, error: flagsError } = await query;

      if (flagsError) {
        if (flagsError.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Flags table not found. Please run the migration to create the required tables.');
          setFlaggedItems([]);
        } else {
          throw flagsError;
        }
      } else {
        // Separate property flags and user flags
        const propertyFlags = flags.filter(flag => flag.item_type === 'property');
        let propertyMap = {};

        if (propertyFlags.length > 0) {
          const propertyIds = propertyFlags.map(flag => parseInt(flag.item_id)).filter(id => !isNaN(id));
          if (propertyIds.length > 0) {
            const { data: properties, error: propertiesError } = await supabase
              .from('properties')
              .select(`
                id,
                title,
                address,
                user_profiles!properties_landlord_id_fkey (full_name)
              `)
              .in('id', propertyIds);

            if (!propertiesError && properties) {
              propertyMap = Object.fromEntries(
                properties.map(prop => [prop.id, prop])
              );
            }
          }
        }

        // Combine the flags with property data
        const flaggedItemsWithDetails = flags.map(flag => ({
          ...flag,
          property: flag.item_type === 'property' ? propertyMap[flag.item_id] : null
        }));

        setFlaggedItems(flaggedItemsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching flagged items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (flagId, action) => {
    try {
      const { error } = await supabase
        .from('flags')
        .update({ 
          status: action,
          resolved_at: action !== 'pending' ? new Date().toISOString() : null,
          resolved_by: action !== 'pending' ? (await supabase.auth.getUser()).data.user?.id || null : null
        })
        .eq('id', flagId);

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }

      // Refresh the list
      fetchFlaggedItems();
    } catch (error) {
      console.error('Error updating flag status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h2 className="text-xl font-semibold text-text-primary">Flagged Content</h2>
        <div className="mt-2 md:mt-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === 'pending' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === 'reviewed' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-2 text-sm rounded-md ${
                activeTab === 'resolved' 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary-100 text-text-secondary hover:bg-secondary-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Item Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {flaggedItems.map(flag => (
              <tr key={flag.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary capitalize">
                  {flag.item_type}
                </td>
                <td className="px-6 py-4">
                  {flag.item_type === 'property' && flag.property ? (
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {flag.property.title}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {flag.property.address}
                      </div>
                      <div className="text-sm text-text-secondary">
                        By: {flag.property.user_profiles?.full_name}
                      </div>
                    </div>
                  ) : flag.item_type === 'user' ? (
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        User ID: {flag.item_id}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Report on user profile
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {flag.item_type} ID: {flag.item_id}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {flag.item_type} item
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  <div className="font-medium">{flag.reason}</div>
                  <div className="text-xs">{flag.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${flag.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : flag.status === 'reviewed'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'}`}>
                    {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatDate(flag.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {flag.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(flag.id, 'resolved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(flag.id, 'reviewed')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlaggedContent;