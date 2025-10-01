// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import Homepage from "../src/pages/hompage";
import PropertyListings from "pages/property-listings";
import PropertyDetails from "pages/property-details";
import UserProfileSettings from "pages/user-profile-settings";
import NotFound from "pages/NotFound";
import ComingSoon from "pages/ComingSoon";

// Auth pages
import Login from "pages/auth/Login";
import Signup from "pages/auth/Signup";
import AuthCallback from "pages/auth/Callback";

// Dashboard pages
import Dashboard from "pages/dashboard";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/property-listings" element={<PropertyListings />} />
          <Route path="/property-details" element={<PropertyDetails />} />
          <Route path="/user-profile-settings" element={<UserProfileSettings />} />
          
          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Main dashboard route (role-based) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;