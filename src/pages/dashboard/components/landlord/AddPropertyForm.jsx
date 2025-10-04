import React, { useState, useEffect } from 'react';
import { useGoogleMaps } from '../../../../contexts/GoogleMapsContext';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const PropertyForm = ({ property, onClose, onPropertyAdded, onPropertyUpdated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    address: '', 
    city: '', 
    state: '', 
    zip_code: '', 
    price: '', 
    property_type: 'House', 
    bedrooms: '', 
    bathrooms: '', 
    area_sqft: '',
    year_built: '',
    lot_size: '',
    parking_spaces: '',
    latitude: null,
    longitude: null,
    mls: '',
    amenities: [],
    status: 'draft'
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [geocoder, setGeocoder] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const { isLoaded: googleMapsLoaded } = useGoogleMaps();

  // Initialize geocoder when Google Maps is loaded
  useEffect(() => {
    if (googleMapsLoaded && window.google && window.google.maps) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [googleMapsLoaded]);

  // Predefined amenities list
  const amenitiesList = [
    'Air Conditioning', 'Balcony', 'Basement', 'Basketball Court', 'Cable TV', 
    'Carbon Monoxide Detector', 'Carpet', 'Ceiling Fans', 'Community Clubhouse', 
    'Community Garage', 'Community Laundry', 'Community Pool', 'Community Spa', 
    'Concrete Floors', 'Convection Oven', 'Cooktop', 'Dishwasher', 'Disposal', 
    'Double Pane Windows', 'Dryer', 'Electricity Included', 'Elevator', 
    'Exercise Room', 'Fireplace', 'Fire Sprinklers', 'Fitness Center', 'Flooring - Hardwood', 
    'Flooring - Laminate', 'Flooring - Linoleum', 'Flooring - Tile', 'Garden', 
    'Gas Grill', 'Gas Stove', 'Gated Entry', 'Glass Doors', 'Granite Countertops', 
    'Guest Parking', 'Handicap Accessible', 'Hardwood Floors', 'Heat Pump', 
    'Heating Included', 'Hot Tub', 'Hurricane Shutters', 'In-Ground Pool', 
    'Indoor Parking', 'Internet Included', 'Jetted Tub', 'Lawn Care Included', 
    'Library', 'Linoleum Floors', 'Microwave', 'Near Bus Stop', 'Near Hospital', 
    'Near Highway', 'Near Park', 'Near Shopping', 'Near Subway', 'Oven', 
    'Patio', 'Pets Allowed', 'Playground', 'Pool', 'Porcelain Floors', 
    'Porch', 'Radiant Heating', 'Range Hood', 'Recreation Room', 'Refrigerator', 
    'Sauna', 'Security System', 'Skylights', 'Smart Home', 'Solar Panels', 
    'Sprinkler System', 'Stainless Steel Appliances', 'Storage', 'Sunroom', 
    'Tile Floors', 'Trash Removal', 'Vaulted Ceiling', 'Vinyl Floors', 
    'Walk-In Closet', 'Washer', 'Water Heater', 'Water Included', 'Wheelchair Access', 
    'Wi-Fi Included', 'Window Blinds', 'Window Coverings', 'Wood Floors', 'Yard'
  ];

  useEffect(() => {
    if (property) {
      // Editing existing property
      setFormData({
        title: property.title || '',
        description: property.description || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip_code: property.zip_code || '',
        price: property.price || '',
        property_type: property.property_type || 'House',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area_sqft: property.area_sqft || '',
        year_built: property.year_built || '',
        lot_size: property.lot_size || '',
        parking_spaces: property.parking_spaces || '',
        latitude: property.latitude || null,
        longitude: property.longitude || null,
        mls: property.mls || '',
        amenities: property.amenities || [],
        status: property.status || 'draft'
      });
      
      setSelectedAmenities(property.amenities || []);
      
      // Load existing photos
      loadExistingPhotos(property.id);
    } else {
      // Adding new property
      setFormData({ 
        title: '', 
        description: '', 
        address: '', 
        city: '', 
        state: '', 
        zip_code: '', 
        price: '', 
        property_type: 'House', 
        bedrooms: '', 
        bathrooms: '', 
        area_sqft: '',
        year_built: '',
        lot_size: '',
        parking_spaces: '',
        latitude: null,
        longitude: null,
        mls: '',
        amenities: [],
        status: 'draft'
      });
      setSelectedAmenities([]);
    }
  }, [property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    let newSelected;
    if (selectedAmenities.includes(amenity)) {
      newSelected = selectedAmenities.filter(a => a !== amenity);
    } else {
      newSelected = [...selectedAmenities, amenity];
    }
    
    setSelectedAmenities(newSelected);
    setFormData(prev => ({ ...prev, amenities: newSelected }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotoObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setNewPhotos(prev => [...prev, ...newPhotoObjects]);
  };

  const removeNewPhoto = (previewUrl) => {
    setNewPhotos(prev => prev.filter(p => p.preview !== previewUrl));
    // Clean up the preview URL
    URL.revokeObjectURL(previewUrl);
  };

  const removeExistingPhoto = async (photoId, imageUrl) => {
    try {
      // Delete from storage
      const imagePath = imageUrl.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([imagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Update state
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Error removing photo: ' + error.message);
    }
  };

  const loadExistingPhotos = async (propertyId) => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setExistingPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  // Google Maps Geocoding
  const geocodeAddress = async () => {
    if (!geocoder) {
      alert('Google Maps is not loaded. Please check your API key.');
      return;
    }

    if (!formData.address || !formData.city || !formData.state) {
      alert('Please fill in address, city, and state fields first.');
      return;
    }

    setIsGeocoding(true);
    
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}`;
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          const latitude = location.lat();
          const longitude = location.lng();
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          
          setGeocodeResult({
            latitude,
            longitude,
            formatted_address: results[0].formatted_address
          });
          
          alert(`Location found: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } else {
          alert('Could not geocode address: ' + status);
        }
        setIsGeocoding(false);
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error geocoding address: ' + error.message);
      setIsGeocoding(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zip_code.trim()) newErrors.zip_code = 'ZIP code is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.property_type) newErrors.property_type = 'Property type is required';
    if (!formData.bedrooms) newErrors.bedrooms = 'Bedrooms is required';
    if (!formData.bathrooms) newErrors.bathrooms = 'Bathrooms is required';
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    const bedrooms = parseInt(formData.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 0) {
      newErrors.bedrooms = 'Please enter a valid number of bedrooms';
    }
    
    const bathrooms = parseFloat(formData.bathrooms);
    if (isNaN(bathrooms) || bathrooms < 0) {
      newErrors.bathrooms = 'Please enter a valid number of bathrooms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let propertyId;
      
      if (property) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update({ 
            ...formData, 
            landlord_id: user.id,
            amenities: selectedAmenities
          })
          .eq('id', property.id)
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
        
        // Update property callback
        onPropertyUpdated && onPropertyUpdated();
      } else {
        // Insert new property
        const { data, error } = await supabase
          .from('properties')
          .insert([{
            ...formData, 
            landlord_id: user.id,
            amenities: selectedAmenities,
            status: 'active' // Default to active when created
          }])
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
        
        // Call property added callback
        onPropertyAdded && onPropertyAdded();
      }

      // Upload new photos if any
      if (newPhotos.length > 0) {
        const uploadPromises = newPhotos.map(async (photo) => {
          const fileExt = photo.file.name.split('.').pop();
          const fileName = `${user.id}/${propertyId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, photo.file, { upsert: true });
          
          if (uploadError) throw uploadError;
          return fileName;
        });

        const uploadedFilePaths = await Promise.all(uploadPromises);

        // Create image records in the database
        const imageRecords = uploadedFilePaths.map((path, index) => ({
          property_id: propertyId,
          image_url: supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl,
          is_primary: index === 0 // Set first image as primary
        }));

        const { error: imagesError } = await supabase.from('property_images').insert(imageRecords);
        if (imagesError) throw imagesError;
      }

      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
        </div>
        <form id="property-form" onSubmit={handleSubmit} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Property Title" 
                  className="w-full p-2 border rounded" 
                  required 
                />
                {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Property Type *</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Description" 
                className="w-full p-2 border rounded h-24" 
              />
            </div>
            
            {/* Address Information */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Address Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Address *</label>
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Street Address" 
                    className="w-full p-2 border rounded" 
                    required 
                  />
                  {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">City *</label>
                    <input 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      placeholder="City" 
                      className="w-full p-2 border rounded" 
                      required 
                    />
                    {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">State *</label>
                    <input 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      placeholder="State" 
                      className="w-full p-2 border rounded" 
                      required 
                    />
                    {errors.state && <p className="text-error text-xs mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">ZIP Code *</label>
                    <input 
                      name="zip_code" 
                      value={formData.zip_code} 
                      onChange={handleInputChange} 
                      placeholder="ZIP Code" 
                      className="w-full p-2 border rounded" 
                      required 
                    />
                    {errors.zip_code && <p className="text-error text-xs mt-1">{errors.zip_code}</p>}
                  </div>
                </div>
                
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={geocodeAddress}
                      disabled={isGeocoding || !geocoder}
                      className="px-4 py-2 bg-accent text-white rounded disabled:opacity-50 flex items-center"
                    >
                      {isGeocoding ? (
                        <>
                          <Icon name="Loader" size={16} className="animate-spin mr-2" />
                          Geocoding...
                        </>
                      ) : (
                        <>
                          <Icon name="MapPin" size={16} className="mr-2" />
                          Get Exact Location
                        </>
                      )}
                    </button>
                    {geocodeResult && (
                      <p className="text-sm text-success mt-2">
                        Coordinates: {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Price *</label>
                  <input 
                    type="number"
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    placeholder="Price" 
                    className="w-full p-2 border rounded" 
                    required 
                  />
                  {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Bedrooms *</label>
                  <input 
                    type="number"
                    name="bedrooms" 
                    value={formData.bedrooms} 
                    onChange={handleInputChange} 
                    placeholder="Bedrooms" 
                    className="w-full p-2 border rounded" 
                    required 
                    min="0"
                  />
                  {errors.bedrooms && <p className="text-error text-xs mt-1">{errors.bedrooms}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Bathrooms *</label>
                  <input 
                    type="number"
                    name="bathrooms" 
                    value={formData.bathrooms} 
                    onChange={handleInputChange} 
                    placeholder="Bathrooms" 
                    className="w-full p-2 border rounded" 
                    required 
                    min="0"
                    step="0.5"
                  />
                  {errors.bathrooms && <p className="text-error text-xs mt-1">{errors.bathrooms}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Area (sq ft)</label>
                  <input 
                    type="number"
                    name="area_sqft" 
                    value={formData.area_sqft} 
                    onChange={handleInputChange} 
                    placeholder="Area" 
                    className="w-full p-2 border rounded" 
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Year Built</label>
                  <input 
                    type="number"
                    name="year_built" 
                    value={formData.year_built} 
                    onChange={handleInputChange} 
                    placeholder="Year Built" 
                    className="w-full p-2 border rounded" 
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Lot Size (sq ft)</label>
                  <input 
                    type="number"
                    name="lot_size" 
                    value={formData.lot_size} 
                    onChange={handleInputChange} 
                    placeholder="Lot Size" 
                    className="w-full p-2 border rounded" 
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Parking Spaces</label>
                  <input 
                    type="number"
                    name="parking_spaces" 
                    value={formData.parking_spaces} 
                    onChange={handleInputChange} 
                    placeholder="Parking Spaces" 
                    className="w-full p-2 border rounded" 
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">MLS Number</label>
                  <input 
                    type="text"
                    name="mls" 
                    value={formData.mls} 
                    onChange={handleInputChange} 
                    placeholder="MLS #" 
                    className="w-full p-2 border rounded" 
                  />
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Amenities</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 p-2 bg-background rounded hover:bg-secondary-100">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Photos */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Photos</h3>
              
              <div>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full" />
                
                {/* Display existing photos */}
                {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {existingPhotos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img 
                          src={photo.image_url} 
                          alt="Property" 
                          className="w-full h-24 object-cover rounded" 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeExistingPhoto(photo.id, photo.image_url)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon name="X" size={12} />
                        </button>
                        {photo.is_primary && (
                          <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {/* Display new photos */}
                    {newPhotos.map(p => (
                      <div key={p.preview} className="relative group">
                        <img 
                          src={p.preview} 
                          alt="Preview" 
                          className="w-full h-24 object-cover rounded" 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeNewPhoto(p.preview)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Status */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Status</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Property Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </div>
        </form>
        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded text-text-secondary">Cancel</button>
          <button type="submit" form="property-form" disabled={isSubmitting} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">
            {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;