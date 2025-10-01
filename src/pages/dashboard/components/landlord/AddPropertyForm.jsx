import React, { useState, useEffect } from 'react';
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
    status: 'draft'
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
        status: property.status || 'draft'
      });
      
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
        status: 'draft'
      });
      setExistingPhotos([]);
      setNewPhotos([]);
    }
  }, [property]);

  const loadExistingPhotos = async (propertyId) => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId);

      if (error) throw error;
      setExistingPhotos(data || []);
    } catch (error) {
      console.error('Error loading existing photos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotoObjects = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewPhotos(prev => [...prev, ...newPhotoObjects]);
  };

  const removeExistingPhoto = (photoId, imageUrl) => {
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const removeNewPhoto = (previewUrl) => {
    setNewPhotos(prev => prev.filter(p => p.preview !== previewUrl));
    URL.revokeObjectURL(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let propertyId;
      
      if (property) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update({ ...formData, landlord_id: user.id })
          .eq('id', property.id)
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
        
        // Update property onPropertyUpdated
        onPropertyUpdated && onPropertyUpdated();
      } else {
        // Insert new property
        const { data, error } = await supabase
          .from('properties')
          .insert([{ ...formData, landlord_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        propertyId = data.id;
        
        // Call onPropertyAdded for new property
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
          is_primary: false // Will set first as primary after upload
        }));

        const { error: imagesError } = await supabase.from('property_images').insert(imageRecords);
        if (imagesError) throw imagesError;

        // If this is the first set of images, set the first one as primary
        if (existingPhotos.length === 0 && newPhotos.length > 0) {
          const firstImage = imageRecords[0];
          await supabase
            .from('property_images')
            .update({ is_primary: true })
            .eq('property_id', propertyId)
            .eq('image_url', firstImage.image_url);
        }
      }

      // Call appropriate callback based on whether it was an edit or add
      if (property) {
        onPropertyUpdated && onPropertyUpdated();
      } else {
        onPropertyAdded && onPropertyAdded();
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
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
        </div>
        <form id="property-form" onSubmit={handleSubmit} className="overflow-y-auto flex-grow">
          <div className="p-6 space-y-4">
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              placeholder="Property Title" 
              className="w-full p-2 border rounded" 
              required 
            />
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Description" 
              className="w-full p-2 border rounded h-24" 
            />
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              placeholder="Address" 
              className="w-full p-2 border rounded" 
              required 
            />
            <div className="grid grid-cols-3 gap-4">
              <input 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                placeholder="City" 
                className="w-full p-2 border rounded" 
                required 
              />
              <input 
                name="state" 
                value={formData.state} 
                onChange={handleInputChange} 
                placeholder="State" 
                className="w-full p-2 border rounded" 
                required 
              />
              <input 
                name="zip_code" 
                value={formData.zip_code} 
                onChange={handleInputChange} 
                placeholder="ZIP Code" 
                className="w-full p-2 border rounded" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                name="price" 
                type="number" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="Price" 
                className="w-full p-2 border rounded" 
                required 
              />
              <select 
                name="property_type" 
                value={formData.property_type} 
                onChange={handleInputChange} 
                className="w-full p-2 border rounded"
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Land">Land</option>
                <option value="Shop">Shop</option>
                <option value="Condo">Condo</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input 
                name="bedrooms" 
                type="number" 
                value={formData.bedrooms} 
                onChange={handleInputChange} 
                placeholder="Bedrooms" 
                className="w-full p-2 border rounded" 
              />
              <input 
                name="bathrooms" 
                type="number" 
                value={formData.bathrooms} 
                onChange={handleInputChange} 
                placeholder="Bathrooms" 
                className="w-full p-2 border rounded" 
              />
              <input 
                name="area_sqft" 
                type="number" 
                value={formData.area_sqft} 
                onChange={handleInputChange} 
                placeholder="Area (sqft)" 
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
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
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Photos</label>
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
