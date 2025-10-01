import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newSubscription, setNewSubscription] = useState({
    id: null,
    name: '',
    price: 0,
    duration_months: 1,
    features: [],
    is_active: true
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Subscription plans table not found. Please run the migration to create the required tables.');
          setSubscriptions([]);
        } else {
          throw error;
        }
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription) => {
    setNewSubscription({
      ...subscription,
      features: subscription.features || []
    });
    setEditingId(subscription.id);
  };

  const handleSave = async () => {
    try {
      let result;
      if (editingId) {
        // Update existing subscription
        result = await supabase
          .from('subscription_plans')
          .update({
            name: newSubscription.name,
            price: newSubscription.price,
            duration_months: newSubscription.duration_months,
            features: newSubscription.features,
            is_active: newSubscription.is_active
          })
          .eq('id', editingId)
          .select()
          .single();
      } else {
        // Create new subscription
        result = await supabase
          .from('subscription_plans')
          .insert([{
            name: newSubscription.name,
            price: newSubscription.price,
            duration_months: newSubscription.duration_months,
            features: newSubscription.features,
            is_active: newSubscription.is_active
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
      fetchSubscriptions();
      setEditingId(null);
      setNewSubscription({
        id: null,
        name: '',
        price: 0,
        duration_months: 1,
        features: [],
        is_active: true
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewSubscription({
      id: null,
      name: '',
      price: 0,
      duration_months: 1,
      features: [],
      is_active: true
    });
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
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
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...newSubscription.features];
    updatedFeatures[index] = value;
    setNewSubscription({
      ...newSubscription,
      features: updatedFeatures
    });
  };

  const addFeature = () => {
    setNewSubscription({
      ...newSubscription,
      features: [...newSubscription.features, '']
    });
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...newSubscription.features];
    updatedFeatures.splice(index, 1);
    setNewSubscription({
      ...newSubscription,
      features: updatedFeatures
    });
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
      <h2 className="text-xl font-semibold text-text-primary mb-4">Subscription Management</h2>
      
      <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
        <h3 className="font-medium text-text-primary mb-2">
          {editingId ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Plan Name</label>
            <input
              type="text"
              value={newSubscription.name}
              onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              placeholder="Plan name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={newSubscription.price}
              onChange={(e) => setNewSubscription({...newSubscription, price: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Duration (Months)</label>
            <input
              type="number"
              value={newSubscription.duration_months}
              onChange={(e) => setNewSubscription({...newSubscription, duration_months: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={newSubscription.is_active}
              onChange={(e) => setNewSubscription({...newSubscription, is_active: e.target.value === 'true'})}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-text-secondary">Features</label>
            <button
              type="button"
              onClick={addFeature}
              className="text-sm text-primary hover:text-primary-dark"
            >
              + Add Feature
            </button>
          </div>
          {newSubscription.features.map((feature, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-text-primary mr-2"
                placeholder="Feature description"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Plan Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Features</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {subscriptions.map(subscription => (
              <tr key={subscription.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {subscription.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  ${subscription.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {subscription.duration_months} month{subscription.duration_months !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  <ul className="list-disc list-inside">
                    {(subscription.features || []).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {subscription.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
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

export default SubscriptionManagement;