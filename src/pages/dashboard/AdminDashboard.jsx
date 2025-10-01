
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserManagement from './components/admin/UserManagement';
import PropertyApproval from './components/admin/PropertyApproval';
import PlatformAnalytics from './components/admin/PlatformAnalytics';
import CommissionManagement from './components/admin/CommissionManagement';
import PaymentManagement from './components/admin/PaymentManagement';
import FlaggedContent from './components/admin/FlaggedContent';
import SupportInbox from './components/admin/SupportInbox';
import SubscriptionManagement from './components/admin/SubscriptionManagement';
import Header from '../../components/ui/Header';

const AdminDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold leading-tight">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-text-secondary">
            Welcome back, {userProfile?.full_name || 'Admin'}. Here's an overview of the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PropertyApproval />
          </div>
          <div className="lg:col-span-1">
            <PlatformAnalytics />
          </div>
          <div className="lg:col-span-3">
            <UserManagement />
          </div>
          <div className="lg:col-span-3">
            <CommissionManagement />
          </div>
          <div className="lg:col-span-3">
            <PaymentManagement />
          </div>
          <div className="lg:col-span-3">
            <FlaggedContent />
          </div>
          <div className="lg:col-span-3">
            <SupportInbox />
          </div>
          <div className="lg:col-span-3">
            <SubscriptionManagement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
