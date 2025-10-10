import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';

const UnitManagement = ({ propertyId }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [formData, setFormData] = useState({
    unit_name: '',
    price: '',
    amenities: {},
    images: []
  });

  const [amenitiesOptions] = useState([
    'wifi', 'parking', 'laundry', 'gym', 'pool', 
    'balcony', 'furnished', 'kitchen', 'ac', 'hotwater'
  ]);

  useEffect(() => {
    if (propertyId) {
      fetchUnits();
    }
  }, [propertyId]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('property_id', propertyId)
        .order('unit_name', { ascending: true });

      if (error) throw error;

      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async () => {
    if (!validateForm()) return;

    try {
      const unitData = {
        property_id: propertyId,
        unit_name: formData.unit_name.trim(),
        price: parseFloat(formData.price),
        amenities: formData.amenities,
        images: formData.images,
        status: 'Available'
      };

      const { error } = await supabase
        .from('units')
        .insert([unitData]);

      if (error) throw error;

      resetForm();
      setShowAddUnitForm(false);
      fetchUnits();
    } catch (error) {
      console.error('Error adding unit:', error);
      alert('Error adding unit: ' + error.message);
    }
  };

  const handleUpdateUnit = async () => {
    if (!validateForm()) return;

    try {
      const unitData = {
        unit_name: formData.unit_name.trim(),
        price: parseFloat(formData.price),
        amenities: formData.amenities,
        images: formData.images
      };

      const { error } = await supabase
        .from('units')
        .update(unitData)
        .eq('id', editingUnit.id);

      if (error) throw error;

      resetForm();
      setEditingUnit(null);
      fetchUnits();
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Error updating unit: ' + error.message);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('units')
          .delete()
          .eq('id', unitId);

        if (error) throw error;

        fetchUnits();
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Error deleting unit: ' + error.message);
      }
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  const validateForm = () => {
    if (!formData.unit_name.trim()) {
      alert('Unit name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Valid price is required');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      unit_name: '',
      price: '',
      amenities: {},
      images: []
    });
  };

  const startEditUnit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      unit_name: unit.unit_name,
      price: unit.price.toString(),
      amenities: unit.amenities || {},
      images: unit.images || []
    });
    setShowAddUnitForm(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary-100 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Unit Management</h2>
          <button
            onClick={() => {
              setEditingUnit(null);
              setShowAddUnitForm(true);
              resetForm();
            }}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Add Unit
          </button>
        </div>
        
        {showAddUnitForm && (
          <div className="bg-secondary-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-text-primary mb-3">
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Unit Name
                </label>
                <input
                  type="text"
                  value={formData.unit_name}
                  onChange={(e) => setFormData({...formData, unit_name: e.target.value})}
                  placeholder="e.g., Room 1A, Studio A"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Price per Year
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {amenitiesOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities[amenity] || false}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-text-secondary capitalize">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowAddUnitForm(false);
                  setEditingUnit(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-border text-text-primary rounded-md hover:bg-secondary-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={editingUnit ? handleUpdateUnit : handleAddUnit}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                {editingUnit ? 'Update Unit' : 'Add Unit'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {units.length > 0 ? (
          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="border border-border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-text-primary">{unit.unit_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      unit.status === 'Available' 
                        ? 'bg-success-100 text-success-800' 
                        : unit.status === 'Booked' || unit.status === 'Occupied'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-secondary-100 text-text-secondary'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                  <p className="text-primary font-medium">{formatPrice(unit.price)}</p>
                  
                  {/* Unit Amenities */}
                  {unit.amenities && Object.keys(unit.amenities).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(unit.amenities).map(([amenity, value]) => (
                        value && (
                          <span 
                            key={amenity} 
                            className="text-xs bg-secondary-100 text-text-secondary px-2 py-0.5 rounded-full"
                          >
                            {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startEditUnit(unit)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Unit"
                  >
                    <Icon name="Edit" size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Unit"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Home" size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-medium text-text-primary">No Units Added</h3>
            <p className="text-text-secondary mt-1">
              Add your first unit to this property.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitManagement;