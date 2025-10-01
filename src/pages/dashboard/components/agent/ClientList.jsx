import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const ClientList = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Get clients who have interacted with agent's properties
      // This includes inquiry makers, showing requesters, etc.
      
      // First, get all properties managed by this agent
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .eq('agent_id', user.id);

      if (propertiesError) throw propertiesError;

      if (properties.length > 0) {
        const propertyIds = properties.map(p => p.id);
        
        // Get all inquiries for these properties
        const { data: inquiries, error: inquiriesError } = await supabase
          .from('property_inquiries')
          .select('student_id')
          .in('property_id', propertyIds);

        if (inquiriesError) throw inquiriesError;

        // Get unique student IDs from inquiries
        const studentIds = [...new Set(inquiries.map(i => i.student_id))];
        
        if (studentIds.length > 0) {
          // Get user profiles for these students
          const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, role, created_at')
            .in('id', studentIds);

          if (profilesError) throw profilesError;

          // Add client type based on their activity
          const clientsWithActivity = profiles.map(profile => ({
            ...profile,
            client_type: 'Inquirer',
            last_interaction: 'Inquiry'
          }));

          setClients(clientsWithActivity);
        } else {
          setClients([]);
        }
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      // Check if it's a table not found error
      if (error.code === 'PGRST205') {
        console.warn('Required tables not found. Please run the migration to create the required tables.');
        setClients([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Client List</h2>
      </div>
      <div className="p-6">
        {clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Client Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-secondary-100">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{client.full_name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary capitalize">
                      {client.role}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {client.client_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No clients yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;