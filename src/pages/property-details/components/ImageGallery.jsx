// src/pages/property-details/components/ImageGallery.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageGallery = ({ images = [], title, virtualTour, video }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const thumbnailsRef = useRef(null);

  const minSwipeDistance = 50;

  const handlePrevious = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images?.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex(prev => 
      prev === images?.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    
    // Scroll thumbnail into view
    if (thumbnailsRef?.current) {
      const thumbnail = thumbnailsRef?.current?.children?.[index];
      if (thumbnail) {
        thumbnail?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (isFullscreen) {
      if (e?.key === 'ArrowLeft') handlePrevious();
      if (e?.key === 'ArrowRight') handleNext();
      if (e?.key === 'Escape') setIsFullscreen(false);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e?.targetTouches?.[0]?.clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e?.targetTouches?.[0]?.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrevious();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (!images?.length) {
    return (
      <div className="w-full h-64 md:h-96 bg-secondary-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon name="ImageOff" size={48} className="text-secondary mx-auto mb-2" />
          <p className="text-text-secondary">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-lg bg-surface">
        <Image
          src={images?.[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Navigation Arrows */}
        {images?.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-surface/90 rounded-full flex items-center justify-center hover:bg-surface transition-all duration-200 shadow-elevation-2"
              aria-label="Previous image"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-surface/90 rounded-full flex items-center justify-center hover:bg-surface transition-all duration-200 shadow-elevation-2"
              aria-label="Next image"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-surface/90 px-3 py-1 rounded-md text-sm font-medium">
          {currentImageIndex + 1} / {images?.length}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          {virtualTour && (
            <button
              onClick={() => window.open(virtualTour, '_blank')}
              className="flex items-center space-x-2 bg-surface/90 hover:bg-surface px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
            >
              <Icon name="Camera" size={16} />
              <span className="hidden sm:inline">Virtual Tour</span>
            </button>
          )}
          
          {video && (
            <button
              onClick={() => window.open(video, '_blank')}
              className="flex items-center space-x-2 bg-surface/90 hover:bg-surface px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
            >
              <Icon name="Play" size={16} />
              <span className="hidden sm:inline">Video</span>
            </button>
          )}
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center space-x-2 bg-surface/90 hover:bg-surface px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
            aria-label="View fullscreen"
          >
            <Icon name="Maximize" size={16} />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>
      {/* Thumbnail Navigation */}
      {images?.length > 1 && (
        <div className="relative">
          <div 
            ref={thumbnailsRef}
            className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar"
          >
            {images?.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'ring-2 ring-primary shadow-elevation-2'
                    : 'hover:shadow-elevation-1'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-modal">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images?.[currentImageIndex]}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200"
              aria-label="Close fullscreen"
            >
              <Icon name="X" size={24} />
            </button>
            
            {/* Navigation */}
            {images?.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200"
                  aria-label="Previous image"
                >
                  <Icon name="ChevronLeft" size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200"
                  aria-label="Next image"
                >
                  <Icon name="ChevronRight" size={24} />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-md text-sm">
              {currentImageIndex + 1} / {images?.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;