import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const PaymentManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userProfiles, setUserProfiles] = useState({});
  const [properties, setProperties] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Get all transactions with filters
      let query = supabase
        .from('transactions')
        .select(`
          *,
          user_profiles (full_name),
          properties (title)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('commission_status', filter);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Transactions table not found. Please run the migration to create the required tables.');
          setTransactions([]);
        } else {
          throw error;
        }
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markCommissionPaid = async (transactionId) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ commission_status: 'paid' })
        .eq('id', transactionId);

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }

      // Refresh the list
      fetchTransactions();
    } catch (error) {
      console.error('Error marking commission as paid:', error);
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
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Payment Management</h2>
        <div className="mt-2 md:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-text-primary"
          >
            <option value="all">All Transactions</option>
            <option value="pending">Pending Commission</option>
            <option value="paid">Paid Commission</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Commission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Commission Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                  {transaction.properties?.title || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {transaction.user_profiles?.full_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  ${transaction.commission_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${transaction.commission_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.commission_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : transaction.commission_status === 'refunded'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'}`}>
                    {transaction.commission_status.charAt(0).toUpperCase() + transaction.commission_status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {transaction.commission_status === 'pending' && (
                    <button
                      onClick={() => markCommissionPaid(transaction.id)}
                      className="text-green-600 hover:text-green-900"
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
      
      <div className="mt-6 p-4 bg-secondary-100 rounded-lg">
        <h3 className="font-medium text-text-primary mb-2">Payment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface p-3 rounded-lg">
            <p className="text-sm text-text-secondary">Total Transactions</p>
            <p className="text-xl font-bold text-text-primary">{transactions.length}</p>
          </div>
          <div className="bg-surface p-3 rounded-lg">
            <p className="text-sm text-text-secondary">Pending Commissions</p>
            <p className="text-xl font-bold text-text-primary">
              {transactions.filter(t => t.commission_status === 'pending').length}
            </p>
          </div>
          <div className="bg-surface p-3 rounded-lg">
            <p className="text-sm text-text-secondary">Total Revenue</p>
            <p className="text-xl font-bold text-text-primary">
              ${transactions.reduce((sum, t) => sum + (t.commission_amount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;