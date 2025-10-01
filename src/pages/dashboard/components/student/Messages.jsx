import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Get conversations based on property inquiries
      // This would involve property_inquiries and potentially a messages table
      // For now, we'll use property_inquiries as the basis for conversations
      
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('property_inquiries')
        .select(`
          id, 
          property_id, 
          student_id, 
          message, 
          status, 
          created_at,
          properties (title),
          user_profiles!property_inquiries_student_id_fkey (full_name)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (inquiriesError) {
        if (inquiriesError.code === 'PGRST205') {
          // Table doesn't exist - show empty state
          console.warn('Property inquiries table not found. Please run the migration to create the required tables.');
          setConversations([]);
        } else {
          throw inquiriesError;
        }
      } else {
        // Group inquiries by property as conversations
        const groupedConversations = inquiries.map(inquiry => ({
          id: inquiry.id,
          propertyId: inquiry.property_id,
          propertyTitle: inquiry.properties?.title,
          participantName: 'Property Owner',
          lastMessage: inquiry.message,
          lastMessageDate: inquiry.created_at,
          status: inquiry.status
        }));
        
        setConversations(groupedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // For now, we'll just show the initial inquiry message as the conversation
      // In a real implementation, this would fetch from a messages table
      const { data: inquiry, error } = await supabase
        .from('property_inquiries')
        .select(`
          id,
          message,
          created_at,
          status
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Format as a conversation with the initial message
      const conversationMessages = [
        {
          id: inquiry.id,
          content: inquiry.message,
          sender: 'landlord', // Initial inquiry is from landlord's perspective
          timestamp: inquiry.created_at,
          status: inquiry.status
        }
      ];

      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      // In a real implementation, this would add to a messages table
      // For now, we'll simulate adding the message
      const newMsg = {
        id: Date.now(),
        content: newMessage,
        sender: 'student',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Also update the inquiry status to indicate new message
      await supabase
        .from('property_inquiries')
        .update({ status: 'contacted' })
        .eq('id', selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="flex space-x-4">
          <div className="flex-1 space-y-3">
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
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Messages</h2>
      </div>
      <div className="flex h-96">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-border">
          <div className="p-4">
            <h3 className="font-medium text-text-primary mb-3">Your Conversations</h3>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-secondary-100 ${
                    selectedConversation?.id === conversation.id ? 'bg-secondary-100' : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-text-primary text-sm">{conversation.propertyTitle}</h4>
                      <p className="text-xs text-text-secondary truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      conversation.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {conversation.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">
                    {new Date(conversation.lastMessageDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Icon name="MessageSquare" size={48} className="mx-auto text-text-secondary mb-4" />
                <p className="text-text-secondary">No conversations yet</p>
                <p className="text-xs text-text-tertiary mt-2">Inquiries you send will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-text-primary">{selectedConversation.propertyTitle}</h3>
                <p className="text-xs text-text-secondary">Property Inquiry</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-secondary-50">
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.sender === 'student' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg max-w-xs md:max-w-md ${
                          message.sender === 'student'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white text-text-primary rounded-bl-none border border-border'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{formatDate(message.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-text-secondary">
                      <Icon name="MessageCircle" size={48} className="mx-auto mb-2" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation by sending a message</p>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-border rounded-lg bg-background text-text-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark"
                  >
                    <Icon name="Send" size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-text-secondary">
                <Icon name="MessageCircle" size={48} className="mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;