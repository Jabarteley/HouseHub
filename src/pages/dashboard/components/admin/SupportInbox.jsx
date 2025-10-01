import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import Icon from '../../../../components/AppIcon';

const SupportInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // First get the tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('id, user_id, subject, message, status, priority, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (ticketsError) {
        if (ticketsError.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Support tickets table not found. Please run the migration to create the required tables.');
          setConversations([]);
        } else {
          throw ticketsError;
        }
      } else {
        // Then get the user profiles
        const userIds = [...new Set(tickets.map(ticket => ticket.user_id))];
        let userProfiles = [];
        
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .in('id', userIds);
            
          if (!profilesError) {
            userProfiles = profiles || [];
          }
        }
        
        // Combine tickets with user profiles
        const conversationsWithUsers = tickets.map(ticket => ({
          ...ticket,
          user_profile: userProfiles.find(up => up.id === ticket.user_id) || { full_name: 'Unknown User', email: 'N/A' }
        }));
        
        setConversations(conversationsWithUsers);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId) => {
    try {
      // First get the messages
      const { data: messages, error: messagesError } = await supabase
        .from('support_messages')
        .select('id, ticket_id, sender_id, content, created_at')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        if (messagesError.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Support messages table not found. Please run the migration to create the required tables.');
          setMessages([]);
        } else {
          throw messagesError;
        }
      } else {
        // Then get the user profiles for the senders
        const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
        let senderProfiles = [];
        
        if (senderIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', senderIds);
            
          if (!profilesError) {
            senderProfiles = profiles || [];
          }
        }
        
        // Combine messages with sender profiles
        const messagesWithProfiles = messages.map(message => ({
          ...message,
          sender_profile: senderProfiles.find(sp => sp.id === message.sender_id) || { full_name: 'Unknown User' }
        }));
        
        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedConversation) return;

    try {
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data?.user?.id;

      if (!userId) {
        alert('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedConversation.id,
          sender_id: userId,
          content: currentMessage
        }])
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }

      // Update the conversation's last updated time
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({
          updated_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', selectedConversation.id);

      if (updateError) {
        if (updateError.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw updateError;
        }
      }

      // Refresh the conversation list and messages
      fetchConversations();
      await fetchMessages(selectedConversation.id);
      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEscalate = async (conversationId) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority: 'high' })
        .eq('id', conversationId);

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }

      // Refresh the conversation list
      fetchConversations();
      
      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation({
          ...selectedConversation,
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Error escalating conversation:', error);
    }
  };

  const handleIssueRefund = async (conversationId) => {
    try {
      // In a real implementation, this would process a refund
      // For now, we'll just mark the conversation as closed with a note
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        if (error.code === 'PGRST205') {
          alert('Database table not found. Please run the migration to create the required tables.');
          return;
        } else {
          throw error;
        }
      }

      // Refresh the conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error issuing refund:', error);
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
        <div className="flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="h-16 bg-secondary-100 rounded-lg"></div>
            <div className="h-16 bg-secondary-100 rounded-lg"></div>
            <div className="h-16 bg-secondary-100 rounded-lg"></div>
          </div>
          <div className="flex-1">
            <div className="h-64 bg-secondary-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-2 p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Support Inbox</h2>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Conversations List */}
        <div className="lg:w-1/3">
          <div className="border border-border rounded-lg overflow-hidden">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-border cursor-pointer hover:bg-secondary-100 ${
                  selectedConversation?.id === conversation.id ? 'bg-secondary-100' : ''
                }`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-text-primary">{conversation.user_profile?.full_name || 'Unknown User'}</h3>
                    <p className="text-sm text-text-secondary truncate">{conversation.subject}</p>
                    <p className="text-xs text-text-tertiary truncate">{conversation.message}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      conversation.status === 'open' || conversation.status === 'in_progress' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conversation.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : conversation.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {conversation.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-text-tertiary">
                  {formatDate(conversation.updated_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Conversation Details */}
        <div className="lg:w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="border border-border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">{selectedConversation.subject}</h3>
                    <p className="text-sm text-text-secondary">
                      {selectedConversation.user_profile?.full_name} - {selectedConversation.user_profile?.email}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEscalate(selectedConversation.id)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => handleIssueRefund(selectedConversation.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                    >
                      Issue Refund
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4 mb-4 flex-1 overflow-y-auto max-h-96">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender_id === (supabase.auth.getUser().data?.user?.id || supabase.auth.getUser().data?.user?.id) ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                        message.sender_id === (supabase.auth.getUser().data?.user?.id || supabase.auth.getUser().data?.user?.id)
                          ? 'bg-primary text-white'
                          : 'bg-secondary-100 text-text-primary'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 text-text-tertiary">
                        {message.sender_profile?.full_name || 'User'} - {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full p-3 border border-border rounded-md bg-background text-text-primary mb-3"
                  rows="3"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Send Message
                </button>
              </div>
            </>
          ) : (
            <div className="border border-border rounded-lg p-8 text-center text-text-secondary">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4" />
              <p>Select a conversation to view and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportInbox;