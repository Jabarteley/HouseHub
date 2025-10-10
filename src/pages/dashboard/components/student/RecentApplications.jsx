import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const RecentApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('property_applications')
        .select(`
          id,
          property_id,
          status,
          created_at,
          properties (title)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5); // Only get the 5 most recent applications

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      viewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-secondary-100 rounded-lg"></div>
          <div className="h-12 bg-secondary-100 rounded-lg"></div>
          <div className="h-12 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Recent Applications</h2>
      </div>
      <div className="p-6">
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{app.properties?.title || 'Property'}</p>
                  <p className="text-xs text-text-secondary">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">You haven't submitted any applications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentApplications;
