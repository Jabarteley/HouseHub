import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const DisputeResolution = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      
      // Get disputes from a support tickets table (using the existing support_tickets table)
      // First, fetch the tickets - remove resolved_at since it doesn't exist
      let query = supabase
        .from('support_tickets')
        .select('id, user_id, subject, message, status, priority, created_at, updated_at')
        .ilike('subject', '%dispute%'); // Filter for dispute-related tickets

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: ticketData, error: ticketError } = await query
        .order('id', { ascending: false }); // Order by id instead of created_at

      if (ticketError) {
        if (ticketError.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Support tickets table not found. Please run the migration to create the required tables.');
          setDisputes([]);
        } else {
          throw ticketError;
        }
      } else {
        // Then fetch user profiles separately to avoid relationship issues
        const userIds = [...new Set(ticketData.map(ticket => ticket.user_id))];
        let userProfiles = {};
        
        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', userIds);
            
          if (!userError) {
            userData.forEach(user => {
              userProfiles[user.id] = user.full_name;
            });
          }
        }

        // Combine the data and add resolved_at as N/A
        const ticketsWithUsers = ticketData.map(ticket => ({
          ...ticket,
          resolved_at: 'N/A', // Add this since UI expects it
          user_full_name: userProfiles[ticket.user_id] || 'Unknown User'
        }));

        // Filter for dispute-related tickets
        const disputeTickets = ticketsWithUsers.filter(ticket => 
          ticket.subject.toLowerCase().includes('dispute') ||
          ticket.subject.toLowerCase().includes('refund') ||
          ticket.subject.toLowerCase().includes('complaint') ||
          ticket.message.toLowerCase().includes('dispute') ||
          ticket.message.toLowerCase().includes('refund') ||
          ticket.message.toLowerCase().includes('complaint')
        );
        
        setDisputes(disputeTickets);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId, resolutionStatus) => {
    if (!selectedDispute) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: resolutionStatus,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id || null
        })
        .eq('id', disputeId);

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }

      // If refund was issued, we could add logic here to process the refund
      if (resolutionStatus === 'resolved' && refundAmount > 0) {
        // Process refund logic would go here
        console.log(`Refund of $${refundAmount} processed for dispute ${disputeId}`);
      }

      // Refresh the list
      fetchDisputes();
      setSelectedDispute(null);
      setResolutionNotes('');
      setRefundAmount(0);
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const handleSelectDispute = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionNotes('');
    setRefundAmount(0);
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Dispute Resolution</h2>
        <div className="mt-2 md:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-text-primary"
          >
            <option value="all">All Disputes</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {disputes.map(dispute => (
                  <tr key={dispute.id} className={selectedDispute?.id === dispute.id ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {dispute.user_full_name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">{dispute.subject}</div>
                      <div className="text-sm text-text-secondary truncate max-w-xs">{dispute.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${dispute.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : dispute.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'}`}>
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(dispute.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSelectDispute(dispute)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-secondary-100 rounded-lg p-4 h-full">
            {selectedDispute ? (
              <div>
                <h3 className="font-medium text-text-primary mb-2">Dispute Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-secondary">User</p>
                    <p className="text-sm">{selectedDispute.user_full_name || 'Unknown User'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Subject</p>
                    <p className="text-sm font-medium">{selectedDispute.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Message</p>
                    <p className="text-sm">{selectedDispute.message}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Status</p>
                    <p className="text-sm capitalize">{selectedDispute.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Date</p>
                    <p className="text-sm">{formatDate(selectedDispute.created_at)}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-text-primary mb-2">Resolution</h4>
                    
                    <div className="mb-3">
                      <label className="block text-xs text-text-secondary mb-1">Resolution Notes</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary text-sm"
                        rows="3"
                        placeholder="Enter resolution notes..."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-xs text-text-secondary mb-1">Refund Amount ($)</label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResolveDispute(selectedDispute.id, 'resolved')}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveDispute(selectedDispute.id, 'in_progress')}
                        className="flex-1 px-3 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600"
                      >
                        In Progress
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="FileText" size={48} className="mx-auto text-text-secondary mb-4" />
                <h3 className="text-lg font-medium text-text-primary">No Dispute Selected</h3>
                <p className="text-text-secondary text-sm">Select a dispute from the list to view details and manage resolution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolution;