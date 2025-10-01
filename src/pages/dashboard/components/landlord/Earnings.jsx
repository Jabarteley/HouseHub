import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const Earnings = () => {
  const { user } = useAuth();
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayouts: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      // Get all properties owned by the current landlord
      const { data: properties, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', user.id);

      if (propertyError) throw propertyError;

      if (properties.length > 0) {
        // Get transactions related to those properties
      const propertyIds = properties.map(p => p.id);
      if (propertyIds.length > 0) {
        const { data: transactions, error: transactionError } = await supabase
          .from('transactions') // This table was created in our admin migration
          .select('*')
          .in('property_id', propertyIds)
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: false });

        if (transactionError) {
          if (transactionError.code === 'PGRST205') {
            // Table doesn't exist - show empty state
            console.warn('Transactions table not found. Please run the migration to create the required tables.');
            setEarningsData({
              totalEarnings: 0,
              monthlyEarnings: 0,
              pendingPayouts: 0,
              transactions: []
            });
          } else {
            throw transactionError;
          }
        } else {
          // Calculate earnings
          const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
          const monthly = transactions
            .filter(t => {
              const date = new Date(t.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
          setEarningsData({
            totalEarnings: total,
            monthlyEarnings: monthly,
            pendingPayouts: 0, // This would come from a different query in a real implementation
            transactions: transactions || []
          });
        }
      } else {
        setEarningsData({
          totalEarnings: 0,
          monthlyEarnings: 0,
          pendingPayouts: 0,
          transactions: []
        });
      }
      } else {
        setEarningsData({
          totalEarnings: 0,
          monthlyEarnings: 0,
          pendingPayouts: 0,
          transactions: []
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setEarningsData({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        transactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Earnings</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-secondary-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-secondary">Total Earnings</p>
            <p className="text-2xl font-bold text-text-primary">${earningsData.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-secondary-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-secondary">This Month</p>
            <p className="text-2xl font-bold text-text-primary">${earningsData.monthlyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-secondary-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-text-secondary">Pending Payouts</p>
            <p className="text-2xl font-bold text-text-primary">${earningsData.pendingPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-text-primary mb-3">Recent Transactions</h3>
          {earningsData.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Property</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {earningsData.transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                        {transaction.properties?.title || 'Property'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary">
                        ${parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${transaction.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}`}>
                          {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <Icon name="DollarSign" size={24} className="mx-auto text-text-secondary mb-2" />
              <p className="text-text-secondary">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;