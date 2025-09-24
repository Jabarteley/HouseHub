import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    properties: 0,
    cities: 0,
    transactions: 0,
    agents: 0
  });
  const sectionRef = useRef(null);

  const stats = [
    {
      key: 'properties',
      label: 'Active Properties',
      value: 15420,
      icon: 'Building',
      suffix: '+',
      color: 'text-primary'
    },
    {
      key: 'cities',
      label: 'Cities Covered',
      value: 250,
      icon: 'MapPin',
      suffix: '+',
      color: 'text-accent'
    },
    {
      key: 'transactions',
      label: 'Successful Sales',
      value: 8750,
      icon: 'TrendingUp',
      suffix: '+',
      color: 'text-success'
    },
    {
      key: 'agents',
      label: 'Expert Agents',
      value: 1200,
      icon: 'Users',
      suffix: '+',
      color: 'text-warning'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef?.current) {
      observer?.observe(sectionRef?.current);
    }

    return () => observer?.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 FPS
    const stepDuration = duration / steps;

    stats?.forEach((stat) => {
      let currentStep = 0;
      const increment = stat?.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(Math.floor(increment * currentStep), stat?.value);
        
        setAnimatedValues(prev => ({
          ...prev,
          [stat?.key]: currentValue
        }));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    });
  };

  const formatNumber = (num) => {
    return num?.toLocaleString();
  };

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join our growing community of satisfied buyers, sellers, and agents who have found success through our platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats?.map((stat) => (
            <div
              key={stat?.key}
              className="text-center p-6 lg:p-8 bg-surface rounded-lg shadow-elevation-1
                       hover:shadow-elevation-2 transition-all duration-300 ease-out micro-interaction"
            >
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-opacity-10 flex items-center justify-center
                             ${stat?.color === 'text-primary' ? 'bg-primary' :
                               stat?.color === 'text-accent' ? 'bg-accent' :
                               stat?.color === 'text-success'? 'bg-success' : 'bg-warning'}`}>
                <Icon 
                  name={stat?.icon} 
                  size={32} 
                  className={stat?.color}
                />
              </div>

              {/* Animated Number */}
              <div className="mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-text-primary font-data">
                  {formatNumber(animatedValues?.[stat?.key])}
                </span>
                <span className={`text-2xl lg:text-3xl font-bold ${stat?.color}`}>
                  {stat?.suffix}
                </span>
              </div>

              {/* Label */}
              <p className="text-text-secondary font-medium">
                {stat?.label}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-success" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">Verified Listings</p>
                <p className="text-sm text-text-secondary">All properties verified</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">24/7 Support</p>
                <p className="text-sm text-text-secondary">Always here to help</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                <Icon name="Award" size={24} className="text-accent" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-text-primary">Award Winning</p>
                <p className="text-sm text-text-secondary">Industry recognized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStats;