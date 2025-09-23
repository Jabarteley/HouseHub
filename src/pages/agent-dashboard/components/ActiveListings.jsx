// src/pages/agent-dashboard/components/ActiveListings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ActiveListings = ({ selectedListings = [], onSelectionChange, onBulkAction }) => {
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [sortField, setSortField] = useState('address');
  const [sortDirection, setSortDirection] = useState('asc');

  const listings = [
    {
      id: 1,
      address: '123 Oak Street, Downtown',
      price: 450000,
      status: 'Active',
      daysOnMarket: 12,
      leadCount: 8,
      type: 'House',
      bedrooms: 3,
      bathrooms: 2
    },
    {
      id: 2,
      address: '456 Pine Avenue, Suburbs',
      price: 320000,
      status: 'Pending',
      daysOnMarket: 25,
      leadCount: 15,
      type: 'Condo',
      bedrooms: 2,
      bathrooms: 2
    },
    {
      id: 3,
      address: '789 Maple Drive, Uptown',
      price: 675000,
      status: 'Active',
      daysOnMarket: 5,
      leadCount: 12,
      type: 'House',
      bedrooms: 4,
      bathrooms: 3
    },
    {
      id: 4,
      address: '321 Elm Court, Historic',
      price: 525000,
      status: 'Under Contract',
      daysOnMarket: 18,
      leadCount: 6,
      type: 'Townhouse',
      bedrooms: 3,
      bathrooms: 2.5
    }
  ];

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      onSelectionChange?.(listings?.map(listing => listing?.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectListing = (listingId, checked) => {
    if (checked) {
      onSelectionChange?.([...selectedListings, listingId]);
    } else {
      onSelectionChange?.(selectedListings?.filter(id => id !== listingId));
    }
  };

  const handleBulkActionClick = (action) => {
    if (selectedListings?.length > 0) {
      onBulkAction?.(action, selectedListings);
    }
  };

  const handlePriceEdit = (listingId, currentPrice) => {
    setEditingPrice(listingId);
    setNewPrice(currentPrice?.toString());
  };

  const handlePriceSave = (listingId) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price > 0) {
      console.log(`Update price for listing ${listingId} to $${price}`);
      // Implement price update logic
    }
    setEditingPrice(null);
    setNewPrice('');
  };

  const handlePriceCancel = () => {
    setEditingPrice(null);
    setNewPrice('');
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
      'Active': 'bg-success-100 text-success',
      'Pending': 'bg-warning-100 text-warning',
      'Under Contract': 'bg-primary-100 text-primary',
      'Sold': 'bg-secondary-100 text-secondary-600'
    };
    return statusMap?.[status] || statusMap?.Active;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(price);
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-4 md:mb-0">
            Active Listings ({listings?.length})
          </h3>
          
          {selectedListings?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {selectedListings?.length} selected
              </span>
              <select 
                onChange={(e) => handleBulkActionClick(e?.target?.value)}
                className="border border-border rounded-md px-3 py-1 text-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                defaultValue=""
              >
                <option value="" disabled>Bulk Actions</option>
                <option value="status-update">Update Status</option>
                <option value="price-change">Price Change</option>
                <option value="marketing-campaign">Marketing Campaign</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-100">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedListings?.length === listings?.length}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('address')}
                  className="flex items-center space-x-1 hover:text-text-primary transition-colors duration-200"
                >
                  <span>Property</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('price')}
                  className="flex items-center space-x-1 hover:text-text-primary transition-colors duration-200"
                >
                  <span>Price</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('daysOnMarket')}
                  className="flex items-center space-x-1 hover:text-text-primary transition-colors duration-200"
                >
                  <span>Days on Market</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                <button 
                  onClick={() => handleSort('leadCount')}
                  className="flex items-center space-x-1 hover:text-text-primary transition-colors duration-200"
                >
                  <span>Leads</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings?.map((listing) => (
              <tr key={listing?.id} className="hover:bg-secondary-100 transition-colors duration-200">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedListings?.includes(listing?.id)}
                    onChange={(e) => handleSelectListing(listing?.id, e?.target?.checked)}
                    className="rounded border-border text-primary focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {listing?.address}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {listing?.type} • {listing?.bedrooms}bd, {listing?.bathrooms}ba
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingPrice === listing?.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e?.target?.value)}
                        className="w-24 px-2 py-1 border border-border rounded text-sm focus:border-border-focus focus:ring-1 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handlePriceSave(listing?.id)}
                        className="text-success hover:text-success-600 transition-colors duration-200"
                      >
                        <Icon name="Check" size={16} />
                      </button>
                      <button
                        onClick={handlePriceCancel}
                        className="text-error hover:text-error-500 transition-colors duration-200"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePriceEdit(listing?.id, listing?.price)}
                      className="text-sm font-medium text-text-primary hover:text-primary transition-colors duration-200"
                    >
                      {formatPrice(listing?.price)}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(listing?.status)}`}>
                    {listing?.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">
                  {listing?.daysOnMarket} days
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={16} className="text-text-secondary" />
                    <span className="text-sm text-text-primary">{listing?.leadCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                      <Icon name="Eye" size={16} />
                    </button>
                    <button className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                      <Icon name="Edit" size={16} />
                    </button>
                    <button className="text-text-secondary hover:text-error transition-colors duration-200">
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {listings?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Home" size={48} className="mx-auto text-secondary-300 mb-3" />
          <p className="text-text-secondary">No active listings found</p>
        </div>
      )}
    </div>
  );
};

export default ActiveListings;