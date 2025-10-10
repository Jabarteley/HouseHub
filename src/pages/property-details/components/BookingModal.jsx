import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BookingModal = ({ unit, property, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    duration: 12, // default to 12 months
    message: '',
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        unitId: unit.id,
        propertyId: property.id,
        unitName: unit.unit_name,
        unitPrice: unit.price
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Error submitting booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Book Unit</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-secondary-100 transition-colors duration-200"
            >
              <Icon name="X" size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-secondary-50 rounded-md">
            <h4 className="font-medium text-text-primary">{property.title}</h4>
            <p className="text-text-secondary">{unit.unit_name} • {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(unit.price)} per year</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Move-in Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Duration (months)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[6, 12, 18, 24].map(month => (
                  <option key={month} value={month}>{month} months</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Special Requests
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                placeholder="Any special requests or notes..."
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                id="termsAccepted"
                className="mt-1 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="termsAccepted" className="text-sm text-text-secondary">
                I accept the terms and conditions and understand this is a binding agreement
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border text-text-primary rounded-md hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Submit Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;