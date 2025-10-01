import React, { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const PaymentFlow = ({ propertyId, propertyTitle, amount, type = 'deposit' }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    // Basic formatting for card number (add space every 4 digits)
    if (name === 'number') {
      let formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expiry') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.substring(0, 5);
      setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCard = () => {
    // Basic validation
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
      return { valid: false, error: 'Please enter a valid card number' };
    }
    if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
      return { valid: false, error: 'Please enter a valid expiry date (MM/YY)' };
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
      return { valid: false, error: 'Please enter a valid CVV (3-4 digits)' };
    }
    if (!cardDetails.name.trim()) {
      return { valid: false, error: 'Please enter the cardholder name' };
    }
    
    return { valid: true };
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus(null);

    try {
      const validation = validateCard();
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // In a real implementation, you would integrate with a payment processor like Stripe
      // Here we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a transaction record in the database
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          property_id: propertyId,
          user_id: user.id,
          amount: amount,
          commission_amount: amount * 0.05, // 5% commission
          payment_status: 'completed',
          payment_method: paymentMethod,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} payment for ${propertyTitle}`
        }])
        .select()
        .single();

      if (error) throw error;

      setPaymentStatus({ success: true, transactionId: data.id });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({ 
        success: false, 
        error: error.message || 'Payment failed. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus?.success) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Payment Successful!</h3>
          <p className="text-text-secondary mb-4">
            Your {type} payment of {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(amount)} for {propertyTitle} has been processed.
          </p>
          <p className="text-sm text-text-tertiary mb-6">Transaction ID: {paymentStatus.transactionId}</p>
          <button 
            onClick={() => setPaymentStatus(null)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Payment</h2>
      </div>
      <form onSubmit={processPayment} className="p-6">
        <div className="mb-6">
          <h3 className="font-medium text-text-primary mb-4">Payment Details</h3>
          <div className="bg-secondary-100 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Property:</span>
              <span className="font-medium text-text-primary">{propertyTitle}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-text-secondary">Payment Type:</span>
              <span className="font-medium text-text-primary capitalize">{type}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-text-secondary">Amount:</span>
              <span className="text-xl font-bold text-primary">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-text-primary mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`p-4 border rounded-lg flex items-center justify-center ${
                paymentMethod === 'credit_card' 
                  ? 'border-primary bg-primary-50' 
                  : 'border-border hover:bg-secondary-100'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <Icon name="CreditCard" size={20} className="mr-2" />
              <span>Credit Card</span>
            </button>
            <button
              type="button"
              className={`p-4 border rounded-lg flex items-center justify-center ${
                paymentMethod === 'bank_transfer' 
                  ? 'border-primary bg-primary-50' 
                  : 'border-border hover:bg-secondary-100'
              }`}
              onClick={() => setPaymentMethod('bank_transfer')}
              disabled
            >
              <Icon name="Building2" size={20} className="mr-2" />
              <span>Bank Transfer</span>
            </button>
          </div>
        </div>

        {paymentMethod === 'credit_card' && (
          <div className="mb-6">
            <h3 className="font-medium text-text-primary mb-3">Card Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Card Number</label>
                <input
                  type="text"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleCardInputChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                  maxLength="19"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                    maxLength="4"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardInputChange}
                  placeholder="John Doe"
                  className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {paymentStatus?.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {paymentStatus.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              Processing Payment...
            </div>
          ) : (
            `Pay ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(amount)}`
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentFlow;