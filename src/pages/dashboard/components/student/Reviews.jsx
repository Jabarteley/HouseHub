import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [properties, setProperties] = useState([]);
  const [newReview, setNewReview] = useState({
    propertyId: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReviewsAndProperties();
      setupRealTimeSubscription();
    }
    
    return () => {
      if (realtimeSubscription) {
        supabase.removeSubscription(realtimeSubscription);
      }
    };
  }, [user]);

  const fetchReviewsAndProperties = async () => {
    try {
      setLoading(true);

      // Get properties that the user has interacted with (applied to, viewed, etc.)
      // For now, we'll use properties where the user has an application
      const { data: applications, error: appsError } = await supabase
        .from('property_applications')
        .select(`
          property_id,
          properties (title, address)
        `)
        .eq('student_id', user.id);

      if (appsError) throw appsError;

      // Get existing reviews by this user
      const { data: userReviews, error: reviewsError } = await supabase
        .from('reviews') // Assuming a reviews table exists
        .select(`
          id,
          property_id,
          rating,
          title,
          comment,
          created_at,
          properties (title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsError && reviewsError.code !== 'PGRST205') {
        // If it's not a "table not found" error, throw it
        throw reviewsError;
      }

      setReviews(userReviews || []);
      setProperties(applications?.map(app => app.properties) || []);
    } catch (error) {
      console.error('Error fetching reviews and properties:', error);
      if (error.code === 'PGRST205') {
        console.warn('Reviews table not found. Please run the migration to create the required tables.');
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  const setupRealTimeSubscription = async () => {
    try {
      const subscription = supabase
        .channel('reviews-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reviews',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // Add new review to the top of the list
              setReviews(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              // Update the review in the list
              setReviews(prev => 
                prev.map(review => 
                  review.id === payload.new.id ? payload.new : review
                )
              );
            } else if (payload.eventType === 'DELETE') {
              // Remove the review from the list
              setReviews(prev => prev.filter(review => review.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      setRealtimeSubscription(subscription);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a new review
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          property_id: newReview.propertyId,
          user_id: user.id,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the new review to the state
      setReviews(prev => [data, ...prev]);
      
      // Reset form
      setNewReview({
        propertyId: '',
        rating: 5,
        title: '',
        comment: ''
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Icon
        key={i}
        name={i < rating ? "Star" : "StarOff"}
        size={16}
        className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-text-secondary"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-32 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Reviews</h2>
      </div>
      <div className="p-6">
        {/* Write Review Form */}
        <div className="mb-8 p-4 bg-secondary-100 rounded-lg">
          <h3 className="font-medium text-text-primary mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Property</label>
              <select
                value={newReview.propertyId}
                onChange={(e) => setNewReview({...newReview, propertyId: e.target.value})}
                className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                required
              >
                <option value="">Select a property</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: star})}
                    className="focus:outline-none"
                  >
                    <Icon
                      name={star <= newReview.rating ? "Star" : "StarOff"}
                      size={24}
                      className={star <= newReview.rating ? "text-yellow-500 fill-yellow-500" : "text-text-secondary"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-text-secondary">{newReview.rating} out of 5</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                placeholder="Brief summary of your experience"
                className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                rows="4"
                placeholder="Share details about your experience with this property..."
                className="w-full p-2 border border-border rounded-md bg-background text-text-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews */}
        <div>
          <h3 className="font-medium text-text-primary mb-4">Your Reviews</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-text-primary">{review.title}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="ml-2 text-sm text-text-secondary">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-text-secondary">{review.properties?.title}</span>
                  </div>
                  <p className="text-text-secondary">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Star" size={48} className="mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary">You haven't written any reviews yet</p>
              <p className="text-sm text-text-tertiary mt-2">
                Submit applications or inquiries to properties to be able to leave reviews
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;