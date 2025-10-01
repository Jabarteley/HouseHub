import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const CommissionManagement = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCommission, setNewCommission] = useState({
    id: null,
    role: 'landlord',
    rate: 0,
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commission_rates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Commission rates table not found. Please run the migration to create the required tables.');
          setCommissions([]);
        } else {
          throw error;
        }
      } else {
        setCommissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (commission) => {
    setNewCommission(commission);
    setEditingId(commission.id);
  };

  const handleSave = async () => {
    try {
      let result;
      if (editingId) {
        // Update existing commission
        result = await supabase
          .from('commission_rates')
          .update({
            role: newCommission.role,
            rate: newCommission.rate,
            description: newCommission.description,
            is_active: newCommission.is_active
          })
          .eq('id', editingId)
          .select()
          .single();
      } else {
        // Create new commission
        result = await supabase
          .from('commission_rates')
          .insert([{
            role: newCommission.role,
            rate: newCommission.rate,
            description: newCommission.description,
            is_active: newCommission.is_active
          }])
          .select()
          .single();
      }

      if (result.error) {
        if (result.error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw result.error;
        }
      }
      
      // Refresh the list
      fetchCommissions();
      setEditingId(null);
      setNewCommission({
        id: null,
        role: 'landlord',
        rate: 0,
        description: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving commission:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewCommission({
      id: null,
      role: 'landlord',
      rate: 0,
      description: '',
      is_active: true
    });
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('commission_rates')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }
      
      // Refresh the list
      fetchCommissions();
    } catch (error) {
      console.error('Error deleting commission:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-2 p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Commission Management</h2>
      
      <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
        <h3 className="font-medium text-text-primary mb-2">
          {editingId ? 'Edit Commission Rule' : 'Add New Commission Rule'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
            <select
              value={newCommission.role}
              onChange={(e) => setNewCommission({...newCommission, role: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
            >
              <option value="student">Student</option>
              <option value="landlord">Landlord</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={newCommission.rate}
              onChange={(e) => setNewCommission({...newCommission, rate: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <input
              type="text"
              value={newCommission.description}
              onChange={(e) => setNewCommission({...newCommission, description: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={newCommission.is_active}
              onChange={(e) => setNewCommission({...newCommission, is_active: e.target.value === 'true'})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors mr-2"
          >
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Rate (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {commissions.map(commission => (
              <tr key={commission.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary capitalize">
                  {commission.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {commission.rate}%
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {commission.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${commission.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {commission.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(commission)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(commission.id)}
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
  );
};

export default CommissionManagement;