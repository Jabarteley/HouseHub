import React from 'react';
import Header from '../../../components/ui/Header';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 lg:pt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
                  <div className="flex items-center">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <div className="w-6 h-6 bg-secondary-200 rounded"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
                  <div className="p-6 border-b border-border">
                    <div className="h-6 bg-secondary-100 rounded w-1/3"></div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[...Array(3)]?.map((_, i) => (
                        <div key={i} className="border border-border rounded-lg p-4">
                          <div className="h-4 bg-secondary-100 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-secondary-100 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-secondary-100 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
                  <div className="p-6 border-b border-border">
                    <div className="h-6 bg-secondary-100 rounded w-1/2"></div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {[...Array(3)]?.map((_, i) => (
                        <div key={i} className="h-16 bg-secondary-100 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;