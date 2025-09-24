import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SortDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: 'relevance', label: 'Best Match', icon: 'Star' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'TrendingUp' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'TrendingDown' },
    { value: 'newest', label: 'Newest First', icon: 'Clock' },
    { value: 'oldest', label: 'Oldest First', icon: 'History' },
    { value: 'size', label: 'Largest First', icon: 'Maximize' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = sortOptions?.find(option => option?.value === value) || sortOptions?.[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border 
                 rounded-md text-sm font-medium text-text-primary
                 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 
                 focus:ring-offset-2 transition-all duration-200 ease-out"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon name={selectedOption?.icon} size={16} className="text-text-secondary" />
        <span>Sort: {selectedOption?.label}</span>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-56 bg-surface rounded-md 
                      shadow-elevation-3 border border-border z-dropdown">
          <div className="py-1">
            {sortOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => handleSelect(option?.value)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left
                           transition-colors duration-200 ${
                  option?.value === value
                    ? 'bg-primary-100 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                }`}
              >
                <Icon 
                  name={option?.icon} 
                  size={16} 
                  className={option?.value === value ? 'text-primary' : 'text-text-secondary'}
                />
                <span className="flex-1">{option?.label}</span>
                {option?.value === value && (
                  <Icon name="Check" size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;