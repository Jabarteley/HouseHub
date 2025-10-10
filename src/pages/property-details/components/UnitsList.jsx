import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { supabase } from '../../../lib/supabase';

const UnitsList = ({ propertyId, onBookUnit }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  useEffect(() => {
    fetchUnits();
  }, [propertyId]);

  useEffect(() => {
    if (showAvailableOnly) {
      setFilteredUnits(units.filter(unit => unit.status === 'Available'));
    } else {
      setFilteredUnits(units);
    }
  }, [units, showAvailableOnly]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          unit_name,
          price,
          status,
          amenities,
          images
        `)
        .eq('property_id', propertyId)
        .order('unit_name', { ascending: true });

      if (error) throw error;

      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-secondary-200 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Available Units</h3>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Show Available Only</span>
          </label>
        </div>
      </div>

      {filteredUnits.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Home" size={48} className="text-secondary mx-auto mb-4" />
          <h4 className="text-lg font-medium text-text-primary">No Units Available</h4>
          <p className="text-text-secondary mt-2">
            {showAvailableOnly 
              ? "All units in this property are currently booked." 
              : "No units have been added to this property yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="card p-4 border border-border hover:border-primary/30 transition-colors duration-200">
              <div className="flex space-x-4">
                {/* Unit Image */}
                <div className="w-16 h-16 flex-shrink-0">
                  <Image
                    src={unit.images?.[0] || '/assets/Images/no_image.jpeg'}
                    alt={`Unit ${unit.unit_name}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Unit Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-text-primary">{unit.unit_name}</h4>
                      <p className="text-lg font-bold text-primary mt-1">{formatPrice(unit.price)}</p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      unit.status === 'Available' 
                        ? 'bg-success-100 text-success-800' 
                        : unit.status === 'Booked' || unit.status === 'Occupied'
                          ? 'bg-error-100 text-error-800'
                          : 'bg-warning-100 text-warning-800'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  {/* Unit Amenities */}
                  {unit.amenities && Object.keys(unit.amenities).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(unit.amenities).map(([amenity, value]) => (
                        value && (
                          <span 
                            key={amenity} 
                            className="text-xs bg-secondary-100 text-text-secondary px-2 py-1 rounded-full"
                          >
                            {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                          </span>
                        )
                      ))}
                    </div>
                  )}

                  {/* Book Button */}
                  <div className="mt-3">
                    {unit.status === 'Available' ? (
                      <button
                        onClick={() => onBookUnit(unit)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Book Unit
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-secondary-100 text-text-secondary rounded-md text-sm font-medium cursor-not-allowed"
                      >
                        {unit.status === 'Occupied' ? 'Occupied' : 'Booked'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnitsList;