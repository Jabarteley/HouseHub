import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { supabase } from '../../../lib/supabase';

const AgentSpotlight = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            id, full_name, avatar_url,
            performance:agent_performance(successful_deals)
          `)
          .eq('role', 'agent')
          .order('successful_deals', { foreignTable: 'agent_performance', ascending: false })
          .limit(5);

        if (error) throw error;
        setAgents(data || []);
      } catch (error) {
        console.error('Error fetching top agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAgents();
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % agents.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + agents.length) % agents.length);

  if (loading || agents.length === 0) {
    return (
        <section className="py-16 lg:py-24 bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                <div className="h-96 bg-surface rounded-lg shadow-elevation-2"></div>
            </div>
        </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Meet Our Top Agents</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">Professionals dedicated to finding your perfect home.</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={carouselRef}>
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {agents.map((agent) => (
                <div key={agent.id} className="w-full flex-shrink-0">
                  <div className="max-w-4xl mx-auto bg-surface rounded-lg shadow-elevation-2 overflow-hidden md:flex">
                    <div className="md:w-1/3">
                      <Image src={agent.avatar_url || 'https://randomuser.me/api/portraits/lego/5.jpg'} alt={agent.full_name} className="w-full h-64 md:h-full object-cover" />
                    </div>
                    <div className="md:w-2/3 p-8">
                      <h3 className="text-2xl font-bold text-text-primary mb-1">{agent.full_name}</h3>
                      <p className="text-primary font-medium mb-4">Top Agent</p>
                      <p className="text-text-secondary mb-4">A top performer with {agent.performance[0]?.successful_deals || 0} successful deals.</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium">Contact Agent</button>
                        <button className="flex-1 bg-secondary-100 text-text-primary px-4 py-2 rounded-md font-medium">View Profile</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-surface rounded-full shadow-lg flex items-center justify-center">
            <Icon name="ChevronLeft" size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-surface rounded-full shadow-lg flex items-center justify-center">
            <Icon name="ChevronRight" size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AgentSpotlight;