import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from user_profiles table only
      // Based on the schema, user_profiles table doesn't have created_at column
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, role');

      if (error) throw error;

      // Transform the data to match what the UI expects
      // We'll use the full_name as both name and fallback for email
      const usersWithDefaultEmail = data.map(user => ({
        ...user,
        email: `user-${user.id.substring(0, 8)}@email-hidden` // A placeholder since we can't access auth emails without proper permissions
      }));

      setUsers(usersWithDefaultEmail || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-secondary-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">User Management</h2>
      <div className="text-sm text-text-secondary mb-4">
        Note: Email addresses are not accessible due to permission restrictions. Only role management is available.
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{user.full_name || 'Unnamed User'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm border border-border rounded px-2 py-1 bg-background"
                  >
                    <option value="student">Student</option>
                    <option value="landlord">Landlord</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
