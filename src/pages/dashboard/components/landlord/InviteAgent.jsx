// src/pages/dashboard/components/landlord/InviteAgent.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const InviteAgent = ({ propertyId }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user && propertyId) {
      fetchAvailableAgents();
    }
  }, [user, propertyId]);

  const fetchAvailableAgents = async () => {
    try {
      setLoading(true);
      
      // Get all agents who are not already assigned to this property
      const { data: allAgents, error: agentError } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'agent');
        // Note: Removed the archived field check since it doesn't exist in the schema

      if (agentError) throw agentError;

      // Get property data to check current agent assignment
      const { data: propertyData, error: propError } = await supabase
        .from('properties')
        .select('agent_id')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;

      // Filter out the currently assigned agent if any
      const availableAgents = allAgents.filter(agent => 
        !propertyData.agent_id || agent.id !== propertyData.agent_id
      );
      
      setAgents(availableAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!selectedAgent) {
      alert('Please select an agent to invite');
      return;
    }

    try {
      setInviting(true);
      
      // First, verify that the user owns this property
      const { data: propertyData, error: propError } = await supabase
        .from('properties')
        .select('landlord_id')
        .eq('id', propertyId)
        .eq('landlord_id', user.id)
        .single();

      if (propError || !propertyData) {
        throw new Error('You do not have permission to invite agents to this property');
      }

      // Try creating an agent request in the database
      const { error: requestError } = await supabase
        .from('agent_requests')
        .insert([{
          property_id: propertyId,
          agent_id: selectedAgent,
          status: 'pending',
          message: message || 'Property owner has invited you to represent this property.',
          responded_by: user.id // Include who sent the invitation (the landlord)
        }]);

      if (requestError) {
        console.error('Error inserting into agent_requests:', requestError);
        // Check if it's a table doesn't exist or permission error
        if (requestError.code === '42P01' || requestError.code === '403') {
          // Table doesn't exist or no permission, fallback to direct property assignment
          const { error: propertyUpdateError } = await supabase
            .from('properties')
            .update({ 
              agent_id: selectedAgent,
              agent_status: 'requested'
            })
            .eq('id', propertyId)
            .eq('landlord_id', user.id);

          if (propertyUpdateError) {
            throw propertyUpdateError;
          }
        } else {
          // Some other error occurred
          throw requestError;
        }
      }

      alert('Agent invited successfully!');
      setMessage('');
      setSelectedAgent('');
    } catch (error) {
      console.error('Error inviting agent:', error);
      alert('Failed to invite agent: ' + error.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-background rounded-lg border border-border animate-pulse">
        <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-secondary-100 rounded w-full mb-3"></div>
        <div className="h-32 bg-secondary-100 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Invite Agent</h3>
        <p className="text-sm text-text-secondary mt-1">Invite an agent to represent your property</p>
      </div>
      
      <form onSubmit={handleInvite} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Select Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
          >
            <option value="">Choose an agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Include any special instructions or details for the agent..."
            rows="3"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={!selectedAgent || inviting}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
              !selectedAgent || inviting
                ? 'bg-secondary-100 text-text-secondary cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-700'
            }`}
          >
            {inviting ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteAgent;