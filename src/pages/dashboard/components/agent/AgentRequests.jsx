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
      
      // Check if agent_requests table exists first by attempting a minimal query
      let requestsData = [];
      let hasAgentRequestsTable = true;
      
      try {
        const { data: testResult, error: testError } = await supabase
          .from('agent_requests')
          .select('id')
          .eq('agent_id', user.id)
          .limit(1);

        if (testError) {
          console.log('Agent requests table may not exist or accessible:', testError);
          hasAgentRequestsTable = false;
        } else {
          // Table exists, now fetch the actual data
          const { data: fullResult, error: fullError } = await supabase
            .from('agent_requests')
            .select(`
              id,
              property_id,
              status,
              message,
              requested_at,
              responded_at,
              responded_by
            `)
            .eq('agent_id', user.id)
            .order('requested_at', { ascending: false });

          if (fullError) {
            console.error('Error fetching agent requests:', fullError);
            hasAgentRequestsTable = false;
          } else {
            requestsData = fullResult || [];
          }
        }
      } catch (error) {
        console.log('Agent requests table not accessible:', error);
        hasAgentRequestsTable = false;
      }

      // If agent_requests table exists and we have data, fetch property information separately
      if (hasAgentRequestsTable && requestsData && requestsData.length > 0) {
        const propertyIds = requestsData.map(req => req.property_id);
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, title, address, city, state, price')
          .in('id', propertyIds);

        if (propertiesError) {
          console.error('Error fetching properties for agent requests:', propertiesError);
          // Continue with requests data even if properties fail to load
          setRequests(requestsData.map(req => ({ ...req, properties: null })));
        } else {
          // Map properties to requests
          const requestsWithProperties = requestsData.map(request => {
            const property = propertiesData.find(prop => prop.id === request.property_id);
            return {
              ...request,
              properties: property
            };
          });

          setRequests(requestsWithProperties);
        }
      } else {
        // If agent_requests table doesn't exist, try to find properties assigned to this agent
        const { data: assignedProperties, error: assignedError } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            address,
            city,
            state,
            price,
            agent_status,
            created_at
          `)
          .eq('agent_id', user.id)
          .neq('agent_status', 'unassigned'); // Only get properties assigned to this agent

        if (assignedError) {
          console.error('Error fetching assigned properties:', assignedError);
          setRequests([]);
        } else {
          // Convert these to a similar format for the UI
          const convertedRequests = assignedProperties.map(property => ({
            id: `prop-${property.id}`,
            property_id: property.id,
            status: property.agent_status || 'assigned',
            message: `You have been assigned to this property`,
            requested_at: property.created_at,
            responded_at: null,
            properties: property
          })); 
          
          setRequests(convertedRequests);
        }
      }
    } catch (error) {
      console.error('Error fetching agent requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // First, try to use the database function for accepting agent requests (handles both invitations and requests)
      try {
        const { error } = await supabase.rpc('accept_agent_request', {
          request_id: requestId
        });

        if (error) throw error;
      } catch (rpcError) {
        console.log('Could not use accept_agent_request function, using direct update:', rpcError);
        
        // Fallback to direct table updates
        const { error: updateError } = await supabase
          .from('agent_requests')
          .update({ 
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .eq('agent_id', user.id); // Ensure agent can only update their own requests

        if (updateError) throw updateError;

        // Update property with this agent as the assigned agent
        const request = requests.find(r => r.id === requestId);
        if (request && request.property_id) {
          const { error: propertyError } = await supabase
            .from('properties')
            .update({ 
              agent_id: user.id,
              agent_status: 'assigned'
            })
            .eq('id', request.property_id);

          if (propertyError) throw propertyError;
        }
      }

      // Refresh the requests list
      fetchAgentRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error accepting request: ' + error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('agent_requests')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('agent_id', user.id); // Ensure agent can only update their own requests

      if (error) throw error;

      // Refresh the requests list
      fetchAgentRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request: ' + error.message);
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
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Agent Requests</h3>
        <p className="text-sm text-text-secondary mt-1">Requests from property owners for representation</p>
      </div>
      
      <div className="p-6">
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h4 className="font-medium text-text-primary">{request.properties?.title}</h4>
                    <p className="text-sm text-text-secondary">
                      {request.properties?.address}, {request.properties?.city}, {request.properties?.state}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      Price: ${request.properties?.price?.toLocaleString()}
                    </p>
                    {request.message && (
                      <p className="text-sm text-text-secondary mt-2 italic">"{request.message}"</p>
                    )}
                    {request.responded_by && (
                      <p className="text-xs text-success mt-1">Invitation from property owner</p>
                    )}
                    <p className="text-xs text-text-tertiary mt-2">
                      Requested: {formatDate(request.requested_at)}
                      {request.responded_at && ` | Responded: ${formatDate(request.responded_at)}`}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:items-end space-y-2 md:space-y-0 md:space-x-0 md:flex-row md:space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
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