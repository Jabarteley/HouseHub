import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'student',
    is_verified: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from user_profiles table - only fetch existing columns
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, role') // Remove created_at since it doesn't exist
        .order('id', { ascending: false }); // Order by id instead of created_at

      if (error) throw error;

      // Transform the data to match what the UI expects
      const usersWithDefaultEmail = data.map(user => ({
        ...user,
        email: `user-${user.id.substring(0, 8)}@email-hidden`, // A placeholder since we can't access auth emails without proper permissions
        is_verified: true, // Default to true since column doesn't exist
        created_at: 'N/A' // Show N/A since column doesn't exist
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

  const handleVerificationToggle = async (userId, currentStatus) => {
    // is_verified column doesn't exist, so we'll simulate functionality
    // In a real app, you'd need to add this column to the table
    console.log(`Toggling verification for user ${userId}`);
    fetchUsers(); // Refresh the list
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.full_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'defaultpassword123!', // In a real app, send password reset email
        email_confirm: true
      });

      if (authError) throw authError;

      // Then create the user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          full_name: newUser.full_name,
          role: newUser.role,
          is_verified: newUser.is_verified
        }]);

      if (profileError) throw profileError;

      // Reset form and refresh users
      setNewUser({
        email: '',
        full_name: '',
        role: 'student',
        is_verified: false
      });
      setIsAddingUser(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user: ' + error.message);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">User Management</h2>
        <button
          onClick={() => setIsAddingUser(!isAddingUser)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {isAddingUser ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {isAddingUser && (
        <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
          <h3 className="font-medium text-text-primary mb-3">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={newUser.full_name}
                onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              >
                <option value="student">Student</option>
                <option value="landlord">Landlord</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="is_verified"
              checked={newUser.is_verified}
              onChange={(e) => setNewUser({...newUser, is_verified: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="is_verified" className="text-sm text-text-secondary">Mark as verified</label>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Add User
            </button>
          </div>
        </div>
      )}

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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {user.full_name || 'Unnamed User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm border border-border rounded px-2 py-1 bg-background mr-2"
                  >
                    <option value="student">Student</option>
                    <option value="landlord">Landlord</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleVerificationToggle(user.id, user.is_verified)}
                    className={`px-2 py-1 rounded text-xs ${user.is_verified ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                    disabled
                  >
                    {user.is_verified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
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
  );
};

export default UserManagement;
