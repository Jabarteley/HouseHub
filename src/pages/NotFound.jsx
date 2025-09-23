import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/AppIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="Home" size={48} className="text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/homepage"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white 
                     rounded-md font-medium hover:bg-primary-700 transition-all duration-200 ease-out
                     micro-interaction"
          >
            <Icon name="Home" size={20} className="mr-2" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history?.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-secondary-100 
                     text-text-primary rounded-md font-medium hover:bg-secondary-200 
                     transition-all duration-200 ease-out micro-interaction"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;