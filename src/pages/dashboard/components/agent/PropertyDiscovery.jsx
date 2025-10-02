// src/pages/dashboard/components/agent/PropertyDiscovery.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const PropertyDiscovery = () => {
  const { user } = useAuth();
  const [discoverableProperties, setDiscoverableProperties] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [agentLeads, setAgentLeads] = useState([]);
  const [requestsSent, setRequestsSent] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [requestModal, setRequestModal] = useState({ open: false, property: null });
  const [leadModal, setLeadModal] = useState({ open: false, property: null });
  const [loading, setLoading] = useState({ 
    discoverable: true,
    invitations: true,
    leads: true,
    requests: true,
    listings: true
  });
  const [filters, setFilters] = useState({
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    city: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab, filters]);

  const fetchData = async () => {
    switch (activeTab) {
      case 'discover':
        fetchDiscoverableProperties();
        break;
      case 'invitations':
        fetchInvitations();
        break;
      case 'requests':
        fetchRequestsSent();
        break;
      case 'leads':
        fetchAgentLeads();
        break;
      case 'my-listings':
        fetchMyListings();
        break;
      default:
        break;
    }
  };

  const fetchDiscoverableProperties = async () => {
    try {
      setLoading(prev => ({ ...prev, discoverable: true }));
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          address,
          city,
          state,
          price,
          property_type,
          bedrooms,
          bathrooms,
          area_sqft,
          allow_agents,
          agent_id,
          created_at,
          agent_status,
          property_images(image_url, is_primary)
        `)
        .is('agent_id', null) // Unassigned properties
        .eq('allow_agents', true) // Agent-friendly properties
        .eq('status', 'active') // Only active listings
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.property_type) query = query.eq('property_type', filters.property_type);
      if (filters.min_price) query = query.gte('price', Number(filters.min_price));
      if (filters.max_price) query = query.lte('price', Number(filters.max_price));
      if (filters.bedrooms) query = query.eq('bedrooms', Number(filters.bedrooms));
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);

      const { data, error } = await query;

      if (error) throw error;

      // Get existing requests for these properties
      if (data && data.length > 0) {
        const propertyIds = data.map(p => p.id);
        const { data: requests, error: reqError } = await supabase
          .from('agent_requests')
          .select('property_id, status')
          .eq('agent_id', user.id)
          .in('property_id', propertyIds);

        if (!reqError) {
          const requestsMap = {};
          requests.forEach(req => {
            requestsMap[req.property_id] = req.status;
          });
          
          // Update properties with request status
          const updatedData = data.map(property => ({
            ...property,
            agent_request_status: requestsMap[property.id] || 'none'
          }));
          
          setDiscoverableProperties(updatedData);
        } else {
          setDiscoverableProperties(data.map(p => ({ ...p, agent_request_status: 'none' })));
        }
      } else {
        setDiscoverableProperties(data?.map(p => ({ ...p, agent_request_status: 'none' })) || []);
      }
    } catch (error) {
      console.error('Error fetching discoverable properties:', error);
    } finally {
      setLoading(prev => ({ ...prev, discoverable: false }));
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoading(prev => ({ ...prev, invitations: true }));
      // For now, show properties where agent has been invited - this would come from agent_requests table
      // where status is 'pending' and the agent was invited by an owner/admin
      const { data, error } = await supabase
        .from('agent_requests')
        .select(`
          id,
          requested_at,
          status,
          message,
          property:properties!property_id(id, title, address, city, state, price, property_type, bedrooms, bathrooms, area_sqft, property_images(image_url, is_primary)),
          responded_by_user:user_profiles!responded_by(full_name)
        `)
        .eq('agent_id', user.id)
        .not('responded_by', 'is', null) // Indicates it was an invitation
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(prev => ({ ...prev, invitations: false }));
    }
  };

  const fetchRequestsSent = async () => {
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      const { data, error } = await supabase
        .from('agent_requests')
        .select(`
          id,
          requested_at,
          status,
          commission_offer,
          message,
          property:properties!property_id(id, title, address, city, state, price, property_type, bedrooms, bathrooms, area_sqft, property_images(image_url, is_primary))
        `)
        .eq('agent_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setRequestsSent(data || []);
    } catch (error) {
      console.error('Error fetching requests sent:', error);
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  };

  const fetchAgentLeads = async () => {
    try {
      setLoading(prev => ({ ...prev, leads: true }));
      const { data, error } = await supabase
        .from('agent_leads')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAgentLeads(data || []);
    } catch (error) {
      console.error('Error fetching agent leads:', error);
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  };

  const fetchMyListings = async () => {
    try {
      setLoading(prev => ({ ...prev, listings: true }));
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          address,
          city,
          state,
          price,
          property_type,
          bedrooms,
          bathrooms,
          area_sqft,
          status,
          created_at,
          property_images(image_url, is_primary)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyListings(data || []);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    } finally {
      setLoading(prev => ({ ...prev, listings: false }));
    }
  };

  const requestToRepresent = async (propertyId, commissionOffer, message) => {
    try {
      const { error } = await supabase
        .from('agent_requests')
        .insert([{
          property_id: propertyId,
          agent_id: user.id,
          status: 'pending',
          commission_offer: commissionOffer || null,
          message: message || ''
        }]);

      if (error) throw error;

      // Update property status to 'requested' to show that an agent has requested it
      const { error: propError } = await supabase
        .from('properties')
        .update({ agent_status: 'requested' })
        .eq('id', propertyId);

      if (propError) throw propError;

      // Refresh the discoverable properties
      fetchDiscoverableProperties();
      setRequestModal({ open: false, property: null });
      alert('Request sent successfully!');
    } catch (error) {
      console.error('Error requesting to represent property:', error);
      alert('Failed to send request: ' + error.message);
    }
  };

  const withdrawRequest = async (requestId, propertyId) => {
    try {
      // Update the agent request to 'withdrawn' status
      const { error: updateError } = await supabase
        .from('agent_requests')
        .update({ 
          status: 'withdrawn',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Check if there are any other pending requests for this property
      const { count, error: countError } = await supabase
        .from('agent_requests')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .eq('status', 'pending');

      if (countError) throw countError;

      // If no other pending requests, reset property status to 'unassigned'
      if (count === 0) {
        const { error: propError } = await supabase
          .from('properties')
          .update({ agent_status: 'unassigned' })
          .eq('id', propertyId);

        if (propError) throw propError;
      }

      alert('Request withdrawn successfully!');
      fetchData();
    } catch (error) {
      console.error('Error withdrawing request:', error);
      alert('Failed to withdraw request: ' + error.message);
    }
  };

  const acceptInvitation = async (requestId) => {
    try {
      // Call the database function to handle the acceptance
      const { error } = await supabase.rpc('accept_agent_request', {
        request_id: requestId,
        responder_id: user.id
      });

      if (error) throw error;

      alert('Invitation accepted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation: ' + error.message);
    }
  };

  const createLead = async (leadData) => {
    try {
      const { error } = await supabase
        .from('agent_leads')
        .insert([{
          agent_id: user.id,
          ...leadData,
          status: 'lead'
        }]);

      if (error) throw error;

      alert('Lead created successfully!');
      setLeadModal({ open: false, property: null });
      fetchAgentLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead: ' + error.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const tabs = [
    { id: 'discover', label: 'Discover', count: discoverableProperties.length },
    { id: 'invitations', label: 'Invitations', count: invitations.length },
    { id: 'requests', label: 'Requests Sent', count: requestsSent.length },
    { id: 'leads', label: 'My Leads', count: agentLeads.length },
    { id: 'my-listings', label: 'My Listings', count: myListings.length }
  ];

  // Request to represent modal
  const RequestModal = () => {
    if (!requestModal.open || !requestModal.property) return null;

    const [commissionOffer, setCommissionOffer] = useState('');
    const [message, setMessage] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
        <div className="bg-surface rounded-lg shadow-elevation-3 w-full max-w-md">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Request to Represent</h3>
              <button 
                onClick={() => setRequestModal({ open: false, property: null })}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Send a request to the property owner to represent this property
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={requestModal.property.property_images?.find(img => img.is_primary)?.image_url || '/assets/Images/no_image.jpeg'} 
                alt={requestModal.property.title} 
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <h4 className="font-medium text-text-primary">{requestModal.property.title}</h4>
                <p className="text-sm text-text-secondary">{requestModal.property.address}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Commission Offer (%)</label>
              <input
                type="number"
                value={commissionOffer}
                onChange={(e) => setCommissionOffer(e.target.value)}
                placeholder="e.g., 6.0"
                step="0.1"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the owner why you're interested in representing this property..."
                rows="3"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-border flex justify-end space-x-3">
            <button
              onClick={() => setRequestModal({ open: false, property: null })}
              className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => requestToRepresent(requestModal.property.id, commissionOffer, message)}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Send Request
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create lead modal
  const LeadModal = () => {
    if (!leadModal.open) return null;

    const [formData, setFormData] = useState({
      title: '',
      address: '',
      city: '',
      latitude: null,
      longitude: null,
      owner_contact: null
    });
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e) => {
      const files = Array.from(e.target.files);
      setUploading(true);
      
      // Create previews for the photos
      const newPhotos = files.map(file => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setPhotos(prev => [...prev, ...newPhotos]);
      setUploading(false);
    };

    const removePhoto = (photoId) => {
      setPhotos(prev => {
        const photo = prev.find(p => p.id === photoId);
        if (photo && photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
        return prev.filter(p => p.id !== photoId);
      });
    };

    const handleCreateLead = async () => {
      // Upload photos to Supabase storage if there are any
      let photoUrls = [];
      if (photos.length > 0) {
        try {
          // In a real implementation, you would upload to Supabase storage
          // For now, we'll just store the local previews as placeholder
          photoUrls = photos.map(photo => photo.preview);
        } catch (error) {
          console.error('Error uploading photos:', error);
          alert('Error uploading photos');
          return;
        }
      }

      const leadData = {
        ...formData,
        photos: photoUrls.length > 0 ? photoUrls : null,
        owner_contact: formData.owner_contact ? { contact: formData.owner_contact } : null
      };

      await createLead(leadData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
        <div className="bg-surface rounded-lg shadow-elevation-3 w-full max-w-md">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Create Lead</h3>
              <button 
                onClick={() => {
                  // Clean up preview URLs
                  photos.forEach(photo => URL.revokeObjectURL(photo.preview));
                  setLeadModal({ open: false, property: null });
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Add a property you've discovered for potential listing
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Property Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Property name or description"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Owner Contact (Optional)</label>
              <input
                type="text"
                value={formData.owner_contact || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_contact: e.target.value }))}
                placeholder="Phone or email"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Photos (Optional)</label>
              <div className="border border-dashed border-border rounded-md p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Icon name="Upload" size={24} className="text-text-secondary mb-2" />
                  <span className="text-sm text-text-secondary">Click to upload photos</span>
                  <span className="text-xs text-text-tertiary">Supports JPG, PNG</span>
                </label>
                
                {uploading && (
                  <div className="mt-2 text-center">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
                
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative">
                        <img 
                          src={photo.preview} 
                          alt="Preview" 
                          className="w-full h-16 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(photo.id);
                          }}
                          className="absolute -top-1 -right-1 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-border flex justify-end space-x-3">
            <button
              onClick={() => {
                photos.forEach(photo => URL.revokeObjectURL(photo.preview));
                setLeadModal({ open: false, property: null });
              }}
              className="px-4 py-2 text-text-secondary hover:text-text-primary font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLead}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Create Lead'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscoverTab = () => {
    if (loading.discoverable) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-background rounded-lg p-4 animate-pulse">
              <div className="h-48 bg-secondary-100 rounded-md mb-3"></div>
              <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (discoverableProperties.length === 0) {
      return (
        <div className="text-center py-12">
          <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No properties available for discovery</p>
          <p className="text-sm text-text-tertiary mt-1">Properties that are open to agents will appear here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discoverableProperties.map((property) => {
          const primaryImage = property.property_images?.find(img => img.is_primary);
          const status = property.agent_request_status;
          
          let statusInfo = {
            text: 'Open to agents',
            color: 'bg-primary-100 text-primary',
            action: 'Request to represent',
            actionDisabled: false
          };
          
          if (status === 'pending') {
            statusInfo = {
              text: 'Requested - Waiting for owner',
              color: 'bg-yellow-100 text-yellow-800',
              action: 'Request pending',
              actionDisabled: true
            };
          }

          return (
            <div key={property.id} className="bg-background rounded-lg border border-border overflow-hidden">
              <div className="relative">
                <img 
                  src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'} 
                  alt={property.title || 'Property'} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-1">{property.title}</h3>
                <p className="text-sm text-text-secondary mb-2">{property.address}, {property.city}, {property.state}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-text-primary">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </div>
                </div>

                <button
                  onClick={() => setRequestModal({ open: true, property })}
                  disabled={statusInfo.actionDisabled}
                  className={`w-full py-2 rounded-md text-sm font-medium ${
                    statusInfo.actionDisabled 
                      ? 'bg-secondary-100 text-text-secondary cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary-700'
                  }`}
                >
                  {statusInfo.action}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderInvitationsTab = () => {
    if (loading.invitations) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-background rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (invitations.length === 0) {
      return (
        <div className="text-center py-12">
          <Icon name="Mail" size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No invitations received</p>
          <p className="text-sm text-text-tertiary mt-1">Invitations from property owners or admins will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {invitations.map((invitation) => {
          const primaryImage = invitation.property?.property_images?.find(img => img.is_primary);
          
          return (
            <div key={invitation.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-start space-x-4">
                <img 
                  src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'} 
                  alt={invitation.property?.title || 'Property'} 
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-text-primary">{invitation.property?.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning">
                      {invitation.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{invitation.property?.address}</p>
                  {invitation.message && (
                    <p className="text-sm text-text-secondary mb-3">"{invitation.message}"</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-tertiary">{formatPrice(invitation.property?.price)}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptInvitation(invitation.id)}
                        className="px-3 py-1 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
                      >
                        Accept
                      </button>
                      <button className="px-3 py-1 bg-secondary-100 text-text-secondary rounded-md text-sm font-medium hover:bg-secondary-200">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRequestsTab = () => {
    if (loading.requests) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-background rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (requestsSent.length === 0) {
      return (
        <div className="text-center py-12">
          <Icon name="UserCheck" size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No requests sent</p>
          <p className="text-sm text-text-tertiary mt-1">Requests to represent properties will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requestsSent.map((request) => {
          const primaryImage = request.property?.property_images?.find(img => img.is_primary);
          
          return (
            <div key={request.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-start space-x-4">
                <img 
                  src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'} 
                  alt={request.property?.title || 'Property'} 
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-text-primary">{request.property?.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-warning-100 text-warning' :
                      request.status === 'accepted' ? 'bg-success-100 text-success' :
                      request.status === 'rejected' ? 'bg-error-100 text-error' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{request.property?.address}</p>
                  {request.message && (
                    <p className="text-sm text-text-secondary mb-2">"{request.message}"</p>
                  )}
                  {request.commission_offer && (
                    <p className="text-sm text-text-tertiary">Commission offered: {request.commission_offer}%</p>
                  )}
                  <div className="mt-2 flex justify-between items-center text-sm text-text-tertiary">
                    <span>Requested on: {new Date(request.requested_at).toLocaleDateString()}</span>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => withdrawRequest(request.id, request.property?.id)}
                        className="text-error hover:text-error-700 text-xs font-medium"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const convertLeadToProperty = async (leadId) => {
    try {
      // For now, we'll redirect to the quick listing form pre-filled with lead data
      // In a real implementation, you might want to use the convert_lead_to_property function
      alert(`Lead ${leadId} conversion to property is ready. This would typically open a form to finalize the property listing.`);
    } catch (error) {
      console.error('Error converting lead to property:', error);
      alert('Failed to convert lead: ' + error.message);
    }
  };

  const renderLeadsTab = () => {
    if (loading.leads) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-background rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (agentLeads.length === 0) {
      return (
        <div className="text-center py-12">
          <Icon name="Target" size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No leads created</p>
          <p className="text-sm text-text-tertiary mt-1">Create leads for properties you've discovered</p>
          <button
            onClick={() => setLeadModal({ open: true, property: null })}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Create Lead
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentLeads.map((lead) => (
          <div key={lead.id} className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-text-primary truncate">{lead.title || 'Untitled Lead'}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                lead.status === 'lead' ? 'bg-secondary-100 text-secondary' :
                lead.status === 'owner_contacted' ? 'bg-warning-100 text-warning' :
                lead.status === 'owner_claimed' ? 'bg-success-100 text-success' :
                'bg-gray-100 text-gray-800'
              }`}>
                {lead.status}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-2">{lead.address}</p>
            <p className="text-xs text-text-tertiary">
              Created: {new Date(lead.created_at).toLocaleDateString()}
            </p>
            <div className="mt-2 flex justify-end space-x-2">
              {lead.status === 'lead' && (
                <button 
                  onClick={() => convertLeadToProperty(lead.id)}
                  className="text-sm text-primary hover:text-primary-700"
                >
                  Convert to Listing
                </button>
              )}
              <button className="text-sm text-primary hover:text-primary-700">View Details</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMyListingsTab = () => {
    if (loading.listings) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-background rounded-lg border border-border animate-pulse">
              <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (myListings.length === 0) {
      return (
        <div className="text-center py-12">
          <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary">No listings assigned</p>
          <p className="text-sm text-text-tertiary mt-1">Properties assigned to you will appear here</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myListings.map((property) => {
          const primaryImage = property.property_images?.find(img => img.is_primary);
          
          return (
            <div key={property.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="relative mb-2">
                <img 
                  src={primaryImage?.image_url || '/assets/Images/no_image.jpeg'} 
                  alt={property.title || 'Property'} 
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
              <h3 className="font-semibold text-text-primary truncate">{property.title}</h3>
              <p className="text-sm text-text-secondary truncate">{property.address}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-text-primary">{formatPrice(property.price)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  property.status === 'active' ? 'bg-success-100 text-success' :
                  property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  property.status === 'pending' ? 'bg-warning-100 text-warning' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-text-tertiary">
                Listed: {new Date(property.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary font-heading">Property Discovery</h3>
            <p className="text-sm text-text-secondary mt-1">Find and request to represent properties</p>
          </div>
          
          {activeTab === 'discover' && (
            <button
              onClick={() => setLeadModal({ open: true, property: null })}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 flex items-center space-x-1"
            >
              <Icon name="Plus" size={16} />
              <span>Create Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters for Discover tab */}
      {activeTab === 'discover' && (
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            />
            
            <select
              value={filters.property_type}
              onChange={(e) => setFilters({...filters, property_type: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="House">House</option>
              <option value="Condominium">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Apartment">Apartment</option>
              <option value="Land">Land</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.min_price}
              onChange={(e) => setFilters({...filters, min_price: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.max_price}
              onChange={(e) => setFilters({...filters, max_price: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            />

            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="">Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary-100 text-text-secondary text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'discover' && renderDiscoverTab()}
        {activeTab === 'invitations' && renderInvitationsTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'leads' && renderLeadsTab()}
        {activeTab === 'my-listings' && renderMyListingsTab()}
      </div>

      {/* Modals */}
      <RequestModal />
      <LeadModal />
    </div>
  );
};

export default PropertyDiscovery;