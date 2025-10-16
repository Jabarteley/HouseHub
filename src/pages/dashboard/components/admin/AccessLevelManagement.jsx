import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const AccessLevelManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubAdmin, setNewSubAdmin] = useState({
    email: '',
    role: 'verifier',
    permissions: []
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, is_verified, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const adminUsers = data.filter(user => 
        user.role === 'admin' || 
        user.role === 'verifier' || 
        user.role === 'moderator' ||
        user.role === 'landlord'
      );

      const usersWithEmail = adminUsers.map(user => ({
        ...user,
        email: `user-${user.id.substring(0, 8)}@email-hidden`, // A placeholder since we can't access auth emails without proper permissions
      }));

      setUsers(usersWithEmail || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubAdmin = async () => {
    if (!newSubAdmin.email) {
      alert('Please enter an email address');
      return;
    }

    try {
      // First create the user in Supabase Auth without a password.
      // Supabase will send an invitation email for the user to set their own password.
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newSubAdmin.email,
        email_confirm: true
      });

      if (authError) throw authError;

      // Then create the user profile with sub-admin role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          full_name: `Sub-Admin ${newSubAdmin.email.split('@')[0]}`,
          role: newSubAdmin.role,
          is_verified: true
        }]);

      if (profileError) throw profileError;

      // Reset form and refresh users
      setNewSubAdmin({
        email: '',
        role: 'verifier',
        permissions: []
      });
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      alert('Error creating sub-admin: ' + error.message);
    }
  };

  const handleDeleteSubAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this sub-admin? This action cannot be undone.')) {
      return;
    }
    
    try {
      // First delete from user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // In a real application, you might also want to delete the auth user
      // For now, we'll just remove from our profiles table
      fetchUsers();
    } catch (error) {
      console.error('Error removing sub-admin:', error);
    }
  };

  const handlePromoteDemote = async (userId, currentRole) => {
    let newRole;
    if (currentRole === 'admin') {
      newRole = 'verifier';
    } else if (currentRole === 'verifier') {
      newRole = 'moderator';
    } else if (currentRole === 'moderator') {
      newRole = 'verifier';
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'verifier':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h2 className="text-xl font-semibold text-text-primary">Access Level Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors mt-2 md:mt-0"
        >
          {showAddForm ? 'Cancel' : 'Create Sub-Admin'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
          <h3 className="font-medium text-text-primary mb-3">Create New Sub-Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={newSubAdmin.email}
                onChange={(e) => setNewSubAdmin({...newSubAdmin, email: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
              <select
                value={newSubAdmin.role}
                onChange={(e) => setNewSubAdmin({...newSubAdmin, role: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              >
                <option value="verifier">Verifier</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleCreateSubAdmin}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Create Sub-Admin
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {user.full_name || 'Unnamed User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {user.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handlePromoteDemote(user.id, user.role)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote/Demote'}
                  </button>
                  <button
                    onClick={() => handleDeleteSubAdmin(user.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-secondary-100 rounded-lg p-4">
        <h3 className="font-medium text-text-primary mb-2">Role Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-surface rounded-lg">
            <h4 className="font-medium text-blue-600 mb-1">Verifier</h4>
            <p className="text-xs text-text-secondary">Can approve/reject property listings and verify property documents.</p>
          </div>
          <div className="p-3 bg-surface rounded-lg">
            <h4 className="font-medium text-yellow-600 mb-1">Moderator</h4>
            <p className="text-xs text-text-secondary">Can manage flagged content, user disputes, and support tickets.</p>
          </div>
          <div className="p-3 bg-surface rounded-lg">
            <h4 className="font-medium text-red-600 mb-1">Admin</h4>
            <p className="text-xs text-text-secondary">Full access to all admin functions including user management and system settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessLevelManagement;
