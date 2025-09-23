import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import LandlordDashboard from './LandlordDashboard';
import AgentDashboard from './AgentDashboard';
import StudentDashboard from './StudentDashboard';
import LoadingState from './components/LoadingState';

const Dashboard = () => {
  const { userProfile, profileLoading, loading } = useAuth();

  if (loading || profileLoading) {
    return <LoadingState />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Profile Not Found
          </h2>
          <p className="text-text-secondary">
            Unable to load your profile. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (userProfile?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'landlord':
      return <LandlordDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;