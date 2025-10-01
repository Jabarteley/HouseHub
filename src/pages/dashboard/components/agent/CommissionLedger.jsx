import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const CommissionLedger = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCommissionData();
    }
  }, [user]);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      
      // Get commission data for agent's transactions
      // This will use the transactions table created in our admin migration
      const { data, error } = await supabase
        .from('transactions') // Using the transactions table from admin migrations
        .select(`
          id,
          property_id,
          amount,
          commission_amount,
          commission_status,
          payment_status,
          created_at,
          properties (title)
        `)
        .eq('properties.agent_id', user.id) // Get transactions for properties managed by this agent
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Transactions table not found. Please run the migration to create the required tables.');
          setCommissions([]);
        } else {
          throw error;
        }
      } else {
        setCommissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const markCommissionPaid = async (transactionId) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ commission_status: 'paid' })
        .eq('id', transactionId);

      if (error) throw error;

      // Refresh the list
      fetchCommissionData();
    } catch (error) {
      console.error('Error marking commission as paid:', error);
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
        <h2 className="text-lg font-semibold text-text-primary">Commission Ledger</h2>
      </div>
      <div className="p-6">
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-secondary-100">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{commission.properties?.title}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                      {formatCurrency(commission.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary">
                      {formatCurrency(commission.commission_amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        commission.commission_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : commission.commission_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {commission.commission_status.charAt(0).toUpperCase() + commission.commission_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(commission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {commission.commission_status === 'pending' && (
                        <button
                          onClick={() => markCommissionPaid(commission.id)}
                          className="text-sm text-green-600 hover:text-green-900"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="DollarSign" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No commission records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionLedger;