import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const ActiveListings = ({ onSelectionChange, selectedListings, onBulkAction }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, sortField, sortDirection]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address, price, status, created_at, property_type, bedrooms, bathrooms, property_inquiries(count)')
        .eq('agent_id', user.id)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;

      const listingsWithDaysOnMarket = data.map(l => ({
        ...l,
        daysOnMarket: Math.floor((new Date() - new Date(l.created_at)) / (1000 * 60 * 60 * 24))
      }));

      setListings(listingsWithDaysOnMarket || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProperty = async (propertyId, updates) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId);

      if (error) throw error;
      fetchListings(); // Refresh data
      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      return false;
    }
  };

  const handlePriceSave = async (listingId) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price > 0) {
      await handleUpdateProperty(listingId, { price });
    }
    setEditingPrice(null);
    setNewPrice('');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(listings.map(listing => listing.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectListing = (listingId, checked) => {
    if (checked) {
      onSelectionChange([...selectedListings, listingId]);
    } else {
      onSelectionChange(selectedListings.filter(id => id !== listingId));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'active': 'bg-success-100 text-success',
      'draft': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-warning-100 text-warning',
      'under contract': 'bg-primary-100 text-primary',
      'sold': 'bg-secondary-100 text-secondary-600',
      'rented': 'bg-purple-100 text-purple-600',
    };
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 h-96 animate-pulse"></div>;
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">Active Listings ({listings.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Head */}
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedListings.length === listings.length && listings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button onClick={() => handleSort('address')} className="flex items-center space-x-1"><span>Property</span><Icon name="ArrowUpDown" size={12} /></button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button onClick={() => handleSort('price')} className="flex items-center space-x-1"><span>Price</span><Icon name="ArrowUpDown" size={12} /></button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button onClick={() => handleSort('created_at')} className="flex items-center space-x-1"><span>Days on Market</span><Icon name="ArrowUpDown" size={12} /></button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Leads</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="divide-y divide-border">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-secondary-100">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedListings.includes(listing.id)}
                    onChange={(e) => handleSelectListing(listing.id, e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary">{listing.address || listing.title}</div>
                  <div className="text-sm text-text-secondary">{listing.property_type} â¢ {listing.bedrooms}bd, {listing.bathrooms}ba</div>
                </td>
                <td className="px-6 py-4">
                  {editingPrice === listing.id ? (
                    <div className="flex items-center space-x-2">
                      <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-24 px-2 py-1 border border-border rounded text-sm" autoFocus />
                      <button onClick={() => handlePriceSave(listing.id)}><Icon name="Check" size={16} /></button>
                      <button onClick={() => setEditingPrice(null)}><Icon name="X" size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingPrice(listing.id); setNewPrice(listing.price.toString()); }} className="text-sm font-medium text-text-primary">
                      {formatPrice(listing.price)}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">{listing.daysOnMarket} days</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={16} className="text-text-secondary" />
                    <span className="text-sm text-text-primary">{listing.property_inquiries[0]?.count || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-text-secondary hover:text-text-primary"><Icon name="Edit" size={16} /></button>
                    <button className="text-text-secondary hover:text-error"><Icon name="Trash2" size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {listings.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Home" size={48} className="mx-auto text-secondary-300 mb-3" />
          <p className="text-text-secondary">No active listings found</p>
        </div>
      )}
    </div>
  );
};

export default ActiveListings;