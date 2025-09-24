import React, { useState, useEffect } from 'react';

import Header from '../../components/ui/Header';



import HeroSection from './components/HeroSection';
import FeaturedProperties from './components/FeaturedProperties';
import QuickStats from './components/QuickStats';
import AgentSpotlight from './components/AgentSpotlight';
import Footer from './components/Footer';

const Homepage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (searchParams) => {
    const params = new URLSearchParams();
    Object.entries(searchParams)?.forEach(([key, value]) => {
      if (value) params?.append(key, value);
    });
    window.location.href = `/property-listings?${params?.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          {/* Hero Skeleton */}
          <div className="relative h-[600px] bg-secondary-100 skeleton"></div>
          
          {/* Content Skeletons */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)]?.map((_, i) => (
                <div key={i} className="bg-surface rounded-lg overflow-hidden shadow-elevation-1">
                  <div className="h-48 bg-secondary-100 skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-secondary-100 rounded skeleton"></div>
                    <div className="h-4 bg-secondary-100 rounded w-3/4 skeleton"></div>
                    <div className="h-4 bg-secondary-100 rounded w-1/2 skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-18">
        <HeroSection onSearch={handleSearch} />
        <FeaturedProperties />
        <QuickStats />
        <AgentSpotlight />
      </main>
      
      <Footer />
    </div>
  );
};

export default Homepage;