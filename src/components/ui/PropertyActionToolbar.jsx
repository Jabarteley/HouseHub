import React, { useState } from 'react';
import Icon from '../AppIcon';

const PropertyActionToolbar = ({ 
  property, 
  variant = 'card', 
  user,
  onSave,
  onShare,
  onContact,
  onScheduleTour,
  className = ''
}) => {
  const [isSaved, setIsSaved] = useState(property?.isSaved || false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const handleSave = async () => {
    try {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      if (onSave) {
        await onSave(property?.id, newSavedState);
      }
      
      // Show toast notification
      const message = newSavedState ? 'Property saved to favorites' : 'Property removed from favorites';
      showToast(message, 'success');
    } catch (error) {
      setIsSaved(!isSaved); // Revert on error
      showToast('Failed to update saved status', 'error');
    }
  };

  const handleShare = (platform) => {
    const url = window.location?.href;
    const title = `Check out this property: ${property?.title || 'Property Listing'}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard?.writeText(url)?.then(() => {
        showToast('Link copied to clipboard', 'success');
      })?.catch(() => {
        showToast('Failed to copy link', 'error');
      });
    } else {
      window.open(shareUrls?.[platform], '_blank', 'width=600,height=400');
    }

    setIsShareMenuOpen(false);
    
    if (onShare) {
      onShare(platform, property?.id);
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact(property?.id);
    } else {
      setIsContactFormOpen(true);
    }
  };

  const handleScheduleTour = () => {
    if (onScheduleTour) {
      onScheduleTour(property?.id);
    } else {
      // Default behavior - open scheduling modal or navigate to scheduling page
      showToast('Tour scheduling feature coming soon', 'info');
    }
  };

  const showToast = (message, type) => {
    // Simple toast implementation - in real app this would use a toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white z-modal toast-slide-in
                      ${type === 'success' ? 'bg-success' : 
                        type === 'error' ? 'bg-error' : 
                        type === 'warning' ? 'bg-warning' : 'bg-primary'}`;
    toast.textContent = message;
    document.body?.appendChild(toast);
    
    setTimeout(() => {
      toast?.remove();
    }, 3000);
  };

  if (variant === 'card') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-2">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-all duration-200 ease-out micro-interaction
                       ${isSaved 
                         ? 'bg-error-100 text-error hover:bg-error-500 hover:text-white' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200 hover:text-text-primary'
                       }`}
            aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Icon name={isSaved ? "Heart" : "Heart"} size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              className="p-2 rounded-full bg-secondary-100 text-text-secondary 
                       hover:bg-secondary-200 hover:text-text-primary
                       transition-all duration-200 ease-out micro-interaction"
              aria-label="Share property"
            >
              <Icon name="Share2" size={18} />
            </button>

            {isShareMenuOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-surface rounded-md 
                            shadow-elevation-3 border border-border z-dropdown">
                <div className="py-2">
                  {[
                    { platform: 'facebook', label: 'Facebook', icon: 'Facebook' },
                    { platform: 'twitter', label: 'Twitter', icon: 'Twitter' },
                    { platform: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
                    { platform: 'email', label: 'Email', icon: 'Mail' },
                    { platform: 'copy', label: 'Copy Link', icon: 'Copy' }
                  ]?.map((item) => (
                    <button
                      key={item?.platform}
                      onClick={() => handleShare(item?.platform)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm 
                               text-text-secondary hover:text-text-primary hover:bg-secondary-100
                               transition-colors duration-200"
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Contact Agent Button */}
          <button
            onClick={handleContact}
            className="px-3 py-1.5 bg-accent-100 text-accent-600 rounded-md text-sm font-medium
                     hover:bg-accent-500 hover:text-white transition-all duration-200 ease-out
                     micro-interaction"
          >
            Contact
          </button>

          {/* Schedule Tour Button */}
          <button
            onClick={handleScheduleTour}
            className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
          >
            Tour
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleScheduleTour}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-md font-semibold
                     hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     transition-all duration-200 ease-out micro-interaction"
          >
            <Icon name="Calendar" size={20} className="inline mr-2" />
            Schedule a Tour
          </button>
          
          <button
            onClick={handleContact}
            className="flex-1 bg-accent text-white px-6 py-3 rounded-md font-semibold
                     hover:bg-accent-600 focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
                     transition-all duration-200 ease-out micro-interaction"
          >
            <Icon name="MessageCircle" size={20} className="inline mr-2" />
            Contact Agent
          </button>
        </div>
        {/* Secondary Actions */}
        <div className="flex items-center justify-center space-x-6 pt-2 border-t border-border">
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ease-out
                       ${isSaved 
                         ? 'bg-error-100 text-error hover:bg-error-500 hover:text-white' :'bg-secondary-100 text-text-secondary hover:bg-secondary-200 hover:text-text-primary'
                       }`}
          >
            <Icon name="Heart" size={18} fill={isSaved ? "currentColor" : "none"} />
            <span className="text-sm font-medium">
              {isSaved ? 'Saved' : 'Save Property'}
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-text-secondary 
                       hover:bg-secondary-200 hover:text-text-primary rounded-md
                       transition-all duration-200 ease-out"
            >
              <Icon name="Share2" size={18} />
              <span className="text-sm font-medium">Share</span>
            </button>

            {isShareMenuOpen && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 
                            bg-surface rounded-md shadow-elevation-3 border border-border z-dropdown">
                <div className="py-2">
                  {[
                    { platform: 'facebook', label: 'Facebook', icon: 'Facebook' },
                    { platform: 'twitter', label: 'Twitter', icon: 'Twitter' },
                    { platform: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
                    { platform: 'email', label: 'Email', icon: 'Mail' },
                    { platform: 'copy', label: 'Copy Link', icon: 'Copy' }
                  ]?.map((item) => (
                    <button
                      key={item?.platform}
                      onClick={() => handleShare(item?.platform)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm 
                               text-text-secondary hover:text-text-primary hover:bg-secondary-100
                               transition-colors duration-200"
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-text-secondary 
                     hover:bg-secondary-200 hover:text-text-primary rounded-md
                     transition-all duration-200 ease-out"
          >
            <Icon name="Calculator" size={18} />
            <span className="text-sm font-medium">Calculate</span>
          </button>
        </div>
        {/* Property Stats */}
        {property && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary font-data">
                {property?.views || 0}
              </div>
              <div className="text-xs text-text-secondary">Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary font-data">
                {property?.saves || 0}
              </div>
              <div className="text-xs text-text-secondary">Saves</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary font-data">
                {property?.daysOnMarket || 0}
              </div>
              <div className="text-xs text-text-secondary">Days Listed</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Floating variant for mobile
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 left-4 right-4 bg-surface border border-border 
                      rounded-lg shadow-elevation-4 p-4 z-header ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-all duration-200 ease-out
                         ${isSaved 
                           ? 'bg-error-100 text-error' :'bg-secondary-100 text-text-secondary'
                         }`}
            >
              <Icon name="Heart" size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
            
            <button
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              className="p-2 rounded-full bg-secondary-100 text-text-secondary"
            >
              <Icon name="Share2" size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleContact}
              className="px-4 py-2 bg-accent text-white rounded-md font-medium"
            >
              Contact
            </button>
            <button
              onClick={handleScheduleTour}
              className="px-4 py-2 bg-primary text-white rounded-md font-medium"
            >
              Tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PropertyActionToolbar;