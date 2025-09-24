// src/pages/user-profile-settings/components/PaymentMethods.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PaymentMethods = ({ user, onDataChange }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'credit_card',
      cardType: 'visa',
      lastFour: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      cardholderName: 'John Smith',
      isDefault: true,
      billingAddress: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'US'
      }
    },
    {
      id: '2',
      type: 'credit_card',
      cardType: 'mastercard',
      lastFour: '8888',
      expiryMonth: '06',
      expiryYear: '2026',
      cardholderName: 'John Smith',
      isDefault: false,
      billingAddress: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US'
      }
    }
  ]);

  const [subscriptions, setSubscriptions] = useState([
    {
      id: '1',
      name: 'Premium Agent Plan',
      price: '$49.99',
      billingCycle: 'monthly',
      status: 'active',
      nextBilling: '2024-02-15',
      features: ['Unlimited listings', 'Priority support', 'Advanced analytics', 'Lead management']
    }
  ]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const billingHistory = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Premium Agent Plan - Monthly',
      amount: '$49.99',
      status: 'paid',
      paymentMethod: '•••• 4242'
    },
    {
      id: '2',
      date: '2023-12-15',
      description: 'Premium Agent Plan - Monthly',
      amount: '$49.99',
      status: 'paid',
      paymentMethod: '•••• 4242'
    },
    {
      id: '3',
      date: '2023-11-15',
      description: 'Premium Agent Plan - Monthly',
      amount: '$49.99',
      status: 'paid',
      paymentMethod: '•••• 4242'
    }
  ];

  const handleSetDefault = (cardId) => {
    setPaymentMethods(prev => 
      prev?.map(card => ({
        ...card,
        isDefault: card?.id === cardId
      }))
    );
    onDataChange?.();
  };

  const handleRemoveCard = (cardId) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(prev => prev?.filter(card => card?.id !== cardId));
      onDataChange?.();
    }
  };

  const handleCancelSubscription = (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription? You will lose access to premium features at the end of your current billing period.')) {
      setSubscriptions(prev => 
        prev?.map(sub => 
          sub?.id === subscriptionId 
            ? { ...sub, status: 'cancelled' }
            : sub
        )
      );
      onDataChange?.();
    }
  };

  const handleAddCard = () => {
    // Simulate adding a new card
    const cardType = newCard?.cardNumber?.startsWith('4') ? 'visa' : 'mastercard';
    const newPaymentMethod = {
      id: Date.now()?.toString(),
      type: 'credit_card',
      cardType,
      lastFour: newCard?.cardNumber?.slice(-4),
      expiryMonth: newCard?.expiryMonth,
      expiryYear: newCard?.expiryYear,
      cardholderName: newCard?.cardholderName,
      isDefault: paymentMethods?.length === 0,
      billingAddress: newCard?.billingAddress
    };
    
    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setShowAddCardModal(false);
    setNewCard({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    });
    onDataChange?.();
  };

  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'visa':
        return 'CreditCard';
      case 'mastercard':
        return 'CreditCard';
      case 'amex':
        return 'CreditCard';
      default:
        return 'CreditCard';
    }
  };

  const getCardColor = (cardType) => {
    switch (cardType) {
      case 'visa':
        return 'bg-blue-500';
      case 'mastercard':
        return 'bg-red-500';
      case 'amex':
        return 'bg-green-500';
      default:
        return 'bg-secondary-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary font-heading">
                Payment Methods
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Manage your saved payment methods
              </p>
            </div>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Icon name="Plus" size={16} />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {paymentMethods?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="CreditCard" size={48} className="text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Payment Methods</h3>
              <p className="text-text-secondary mb-4">
                Add a payment method to manage subscriptions and premium features.
              </p>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Add Your First Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods?.map((card) => (
                <div key={card?.id} className="border border-border rounded-lg p-4 relative">
                  {card?.isDefault && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-success text-white px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-8 ${getCardColor(card?.cardType)} rounded flex items-center justify-center`}>
                      <Icon name={getCardIcon(card?.cardType)} size={20} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-text-primary capitalize">
                          {card?.cardType}
                        </span>
                        <span className="text-sm text-text-secondary">
                          •••• {card?.lastFour}
                        </span>
                      </div>
                      
                      <p className="text-sm text-text-secondary mt-1">
                        Expires {card?.expiryMonth}/{card?.expiryYear}
                      </p>
                      
                      <p className="text-sm text-text-secondary">
                        {card?.cardholderName}
                      </p>
                      
                      <div className="flex items-center space-x-3 mt-3">
                        {!card?.isDefault && (
                          <button
                            onClick={() => handleSetDefault(card?.id)}
                            className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveCard(card?.id)}
                          className="text-error hover:text-error-600 text-sm font-medium transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Active Subscriptions */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Active Subscriptions
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your premium subscriptions
          </p>
        </div>

        <div className="p-6">
          {subscriptions?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Package" size={48} className="text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Active Subscriptions</h3>
              <p className="text-text-secondary">
                Upgrade to a premium plan to access advanced features.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions?.map((subscription) => (
                <div key={subscription?.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-text-primary">
                          {subscription?.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subscription?.status === 'active' ?'bg-success-100 text-success'
                            : subscription?.status === 'cancelled' ?'bg-error-100 text-error' :'bg-warning-100 text-warning'
                        }`}>
                          {subscription?.status?.charAt(0)?.toUpperCase() + subscription?.status?.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-text-primary">Price:</span>
                          <span className="text-sm text-text-secondary ml-2">
                            {subscription?.price} / {subscription?.billingCycle}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-primary">Next Billing:</span>
                          <span className="text-sm text-text-secondary ml-2">
                            {subscription?.nextBilling}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-primary">Status:</span>
                          <span className="text-sm text-text-secondary ml-2 capitalize">
                            {subscription?.status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-text-primary">Features:</span>
                        <ul className="text-sm text-text-secondary mt-1 list-disc list-inside">
                          {subscription?.features?.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200">
                        Modify Plan
                      </button>
                      {subscription?.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription?.id)}
                          className="text-error hover:text-error-600 text-sm font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Billing History */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary font-heading">
                Billing History
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                View your payment history and download invoices
              </p>
            </div>
            <button
              onClick={() => setShowBillingHistory(!showBillingHistory)}
              className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
            >
              {showBillingHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>

        {showBillingHistory && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-text-primary">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-text-primary">Description</th>
                    <th className="text-left py-3 text-sm font-medium text-text-primary">Amount</th>
                    <th className="text-left py-3 text-sm font-medium text-text-primary">Payment Method</th>
                    <th className="text-left py-3 text-sm font-medium text-text-primary">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory?.map((transaction) => (
                    <tr key={transaction?.id} className="border-b border-border">
                      <td className="py-3 text-sm text-text-secondary">{transaction?.date}</td>
                      <td className="py-3 text-sm text-text-primary">{transaction?.description}</td>
                      <td className="py-3 text-sm font-medium text-text-primary">{transaction?.amount}</td>
                      <td className="py-3 text-sm text-text-secondary">{transaction?.paymentMethod}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction?.status === 'paid' ?'bg-success-100 text-success' :'bg-error-100 text-error'
                        }`}>
                          {transaction?.status?.charAt(0)?.toUpperCase() + transaction?.status?.slice(1)}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Add Payment Method</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={newCard?.cardNumber}
                  onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: e?.target?.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Expiry Month
                  </label>
                  <select
                    value={newCard?.expiryMonth}
                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e?.target?.value }))}
                    className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)?.padStart(2, '0')}>
                        {String(i + 1)?.padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Expiry Year
                  </label>
                  <select
                    value={newCard?.expiryYear}
                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e?.target?.value }))}
                    className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date()?.getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={newCard?.cvv}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e?.target?.value }))}
                    placeholder="123"
                    className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={newCard?.cardholderName}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cardholderName: e?.target?.value }))}
                    placeholder="John Smith"
                    className="block w-full px-4 py-3 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium text-text-primary mb-3">Billing Address</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newCard?.billingAddress?.street}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      billingAddress: { ...prev?.billingAddress, street: e?.target?.value }
                    }))}
                    placeholder="Street Address"
                    className="block w-full px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newCard?.billingAddress?.city}
                      onChange={(e) => setNewCard(prev => ({ 
                        ...prev, 
                        billingAddress: { ...prev?.billingAddress, city: e?.target?.value }
                      }))}
                      placeholder="City"
                      className="block w-full px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    />
                    <input
                      type="text"
                      value={newCard?.billingAddress?.state}
                      onChange={(e) => setNewCard(prev => ({ 
                        ...prev, 
                        billingAddress: { ...prev?.billingAddress, state: e?.target?.value }
                      }))}
                      placeholder="State"
                      className="block w-full px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={newCard?.billingAddress?.zipCode}
                    onChange={(e) => setNewCard(prev => ({ 
                      ...prev, 
                      billingAddress: { ...prev?.billingAddress, zipCode: e?.target?.value }
                    }))}
                    placeholder="ZIP Code"
                    className="block w-full px-4 py-2 border border-border rounded-md focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCard}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="flex-1 border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;