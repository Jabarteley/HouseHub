// src/pages/dashboard/components/landlord/AgentRequests.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const AgentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAgentRequests();
    }
  }, [user]);

  const fetchAgentRequests = async () => {
    try {
      setLoading(true);
      
      // Using the RPC function to get agent requests for property owner
      const { data, error } = await supabase.rpc('get_agent_requests_for_property_owner');
      
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching agent requests:', error);
      // Try alternative method if RPC fails
      try {
        const { data: altData, error: altError } = await supabase
          .from('agent_requests')
          .select(`
            id,
            property_id,
            agent_id,
            requested_at,
            status,
            commission_offer,
            message,
            properties (title),
            user_profiles (full_name, avatar_url)
          `)
          .in('properties.landlord_id', [user.id])
          .order('requested_at', { ascending: false });

        if (!altError) {
          setRequests(altData || []);
        }
      } catch (altError) {
        console.error('Alternative fetch error:', altError);
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // First, get the request details to verify ownership
      const { data: requestData, error: requestError } = await supabase
        .from('agent_requests')
        .select('property_id, agent_id')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;
      if (!requestData) throw new Error('Request not found');

      // Verify that the property belongs to the current user
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, landlord_id')
        .eq('id', requestData.property_id)
        .eq('landlord_id', user.id)
        .single();

      if (propertyError) throw propertyError;
      if (!propertyData) {
        throw new Error('Unauthorized: You do not own this property');
      }

      // Update the agent request status directly
      const { error: updateError } = await supabase
        .from('agent_requests')
        .update({ 
          status: 'accepted',
          responded_by: user.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Update the property to assign the agent
      const { error: propertyUpdateError } = await supabase
        .from('properties')
        .update({ 
          agent_id: requestData.agent_id,
          agent_status: 'assigned'
        })
        .eq('id', requestData.property_id)
        .eq('landlord_id', user.id); // Ensure the user can only update their own properties

      if (propertyUpdateError) throw propertyUpdateError;

      // Now manually update agent performance using the function we created
      try {
        const { error: perfError } = await supabase.rpc('update_agent_performance_manual', {
          agent_id_param: requestData.agent_id
        });
        
        if (perfError) {
          console.warn('Could not update agent performance:', perfError);
          // Don't fail the whole operation if performance update fails
        }
      } catch (perfError) {
        console.warn('Could not update agent performance:', perfError);
      }
      
      // Refresh requests
      fetchAgentRequests();
      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error accepting request: ' + (error.message || 'Unknown error occurred'));
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { error } = await supabase.rpc('reject_agent_request', { request_id_param: requestId });
      if (error) throw error;
      
      // Refresh requests
      fetchAgentRequests();
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Agent Requests</h3>
        <p className="text-sm text-text-secondary mt-1">Requests from agents to represent your properties</p>
      </div>
      
      <div className="p-6">
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4 hover:bg-secondary-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-text-primary">{request.properties?.title || 'Property'}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        request.status === 'pending' ? 'bg-warning-100 text-warning' :
                        request.status === 'accepted' ? 'bg-success-100 text-success' :
                        request.status === 'rejected' ? 'bg-error-100 text-error' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">Agent: {request.user_profiles?.full_name}</p>
                    {request.message && (
                      <p className="text-sm text-text-secondary mt-1 italic">"{request.message}"</p>
                    )}
                    {request.commission_offer && (
                      <p className="text-sm text-text-tertiary mt-1">Commission Offer: {request.commission_offer}%</p>
                    )}
                    <p className="text-xs text-text-tertiary mt-2">
                      Requested: {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-3 py-1 bg-success-100 text-success rounded-md text-sm font-medium hover:bg-success-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-3 py-1 bg-error-100 text-error rounded-md text-sm font-medium hover:bg-error-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="UserCheck" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No agent requests at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentRequests;