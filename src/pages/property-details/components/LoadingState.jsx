// src/pages/property-details/components/LoadingState.jsx
import React from 'react';

const LoadingState = () => {
  return (
    <main className="pt-16 lg:pt-18">
      {/* Breadcrumb Skeleton */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-secondary-200 rounded w-12 animate-pulse"></div>
            <div className="h-3 bg-secondary-200 rounded w-3 animate-pulse"></div>
            <div className="h-4 bg-secondary-200 rounded w-20 animate-pulse"></div>
            <div className="h-3 bg-secondary-200 rounded w-3 animate-pulse"></div>
            <div className="h-4 bg-secondary-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <div className="w-full h-64 md:h-96 lg:h-[500px] bg-secondary-200 rounded-lg animate-pulse"></div>
              <div className="flex space-x-2">
                {[...Array(6)]?.map((_, index) => (
                  <div key={index} className="w-20 h-20 md:w-24 md:h-24 bg-secondary-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Property Overview Skeleton */}
            <div className="card p-6">
              <div className="space-y-4">
                <div className="h-8 bg-secondary-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-10 bg-secondary-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-5 bg-secondary-200 rounded w-2/3 animate-pulse"></div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                  {[...Array(6)]?.map((_, index) => (
                    <div key={index} className="text-center p-3 bg-background rounded-md">
                      <div className="w-6 h-6 bg-secondary-200 rounded mx-auto mb-2 animate-pulse"></div>
                      <div className="h-6 bg-secondary-200 rounded w-8 mx-auto mb-1 animate-pulse"></div>
                      <div className="h-4 bg-secondary-200 rounded w-12 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="card overflow-hidden">
              <div className="border-b border-border">
                <div className="flex">
                  {[...Array(4)]?.map((_, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="h-5 bg-secondary-200 rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded w-4/6 animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded w-3/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Mortgage Calculator Skeleton */}
            <div className="card p-6">
              <div className="h-6 bg-secondary-200 rounded w-3/4 mb-6 animate-pulse"></div>
              <div className="space-y-6">
                {[...Array(5)]?.map((_, index) => (
                  <div key={index}>
                    <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-10 bg-secondary-200 rounded w-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Card Skeleton */}
            <div className="card p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-secondary-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-secondary-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-secondary-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-secondary-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-12 bg-secondary-200 rounded w-full animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-secondary-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-secondary-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Skeleton */}
        <div className="mt-12">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(3)]?.map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80 md:w-96">
                <div className="card overflow-hidden">
                  <div className="h-48 bg-secondary-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-secondary-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-secondary-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-secondary-200 rounded w-full animate-pulse"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-secondary-200 rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-secondary-200 rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-secondary-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoadingState;