import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const PropertyImageUpload = ({ propertyId, onImagesUploaded }) => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchPropertyImages();
  }, [propertyId]);

  const fetchPropertyImages = async () => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('is_primary', { ascending: false }); // Primary image first

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching property images:', error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload each file to Supabase storage
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${propertyId}/${Date.now()}_${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Update progress
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));

        return {
          property_id: propertyId,
          image_url: supabase.storage
            .from('property-images')
            .getPublicUrl(fileName).data.publicUrl,
          is_primary: false // Will set first as primary after upload
        };
      });

      const imageRecords = await Promise.all(uploadPromises);

      // Insert image records into the database
      const { error: insertError } = await supabase
        .from('property_images')
        .insert(imageRecords);

      if (insertError) throw insertError;

      // If this is the first image, set it as primary
      if (images.length === 0 && imageRecords.length > 0) {
        await supabase
          .from('property_images')
          .update({ is_primary: true })
          .eq('property_id', propertyId)
          .eq('image_url', imageRecords[0].image_url);
      }

      // Refresh the image list
      fetchPropertyImages();
      if (onImagesUploaded) onImagesUploaded();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async (imageId, imageUrl) => {
    try {
      // Extract the storage path from the image URL
      const urlParts = imageUrl.split('/');
      const path = urlParts.slice(3).join('/'); // Skip https://bucket.supabase.co/storage/v1/object/public/

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Refresh the image list
      fetchPropertyImages();
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const setAsPrimary = async (imageId) => {
    try {
      // First, set all images for this property to not be primary
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId);

      // Then, set the selected image as primary
      await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      // Refresh the image list
      fetchPropertyImages();
    } catch (error) {
      console.error('Error setting primary image:', error);
    }
  };

  const requestVerification = async () => {
    try {
      // Create a verification request in the property_verifications table
      const { data, error } = await supabase
        .from('property_verifications')
        .insert([{
          property_id: propertyId,
          verified_by: user.id, // This should be an admin ID in a real scenario, but for demo we'll use landlord
          status: 'pending',
          notes: 'Landlord requested verification for property images and details'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Verification request submitted successfully!');
    } catch (error) {
      console.error('Error requesting verification:', error);
      alert('Error requesting verification. Please try again.');
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary">Property Images</h2>
          <button 
            onClick={requestVerification}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
          >
            Request Verification
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Upload Property Images
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="block w-full text-sm text-text-secondary
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-white
                hover:file:bg-primary-dark"
            />
            {isUploading && (
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-border rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-text-secondary">{uploadProgress}%</span>
              </div>
            )}
          </div>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.image_url} 
                  alt="Property" 
                  className={`w-full h-32 object-cover rounded-lg ${image.is_primary ? 'ring-2 ring-primary' : ''}`}
                />
                {image.is_primary && (
                  <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Primary
                  </span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setAsPrimary(image.id)}
                    className="text-white p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                    title="Set as primary"
                  >
                    <Icon name="Star" size={16} />
                  </button>
                  <button
                    onClick={() => removeImage(image.id, image.image_url)}
                    className="text-white p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                    title="Remove image"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <Icon name="Image" size={48} className="mx-auto text-text-tertiary mb-4" />
            <p className="text-text-secondary">No images uploaded yet</p>
            <p className="text-sm text-text-tertiary mt-1">Upload images to showcase your property</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyImageUpload;