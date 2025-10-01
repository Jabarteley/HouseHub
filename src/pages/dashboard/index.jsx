
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';
import LandlordDashboard from './LandlordDashboard';
import StudentDashboard from './StudentDashboard';
import LoadingState from './components/LoadingState';

const Dashboard = () => {
  const { userProfile, loading, isAdmin, isAgent, isLandlord, isStudent } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isAgent) {
    return <AgentDashboard />;
  }

  if (isLandlord) {
    return <LandlordDashboard />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="mt-4">You do not have permission to view this page.</p>
      </div>
    </div>
  );
};

export default Dashboard;
