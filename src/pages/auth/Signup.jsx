import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';

const Signup = () => {
  const { signUp, signInWithGoogle, loading, error, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const errors = {};

    if (!formData?.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData?.password !== formData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        formData?.email,
        formData?.password,
        {
          full_name: formData?.fullName,
          role: formData?.role
        }
      );
      
      if (!error) {
        // Show success message or redirect
        console.log('Signup successful');
      }
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Home" size={24} color="white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Or{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:text-primary-700 transition-colors duration-200"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Sign Up Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData?.fullName}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary ${
                           validationErrors?.fullName ? 'border-red-500' : 'border-border'
                         }`}
                placeholder="Enter your full name"
              />
              {validationErrors?.fullName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors?.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData?.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary ${
                           validationErrors?.email ? 'border-red-500' : 'border-border'
                         }`}
                placeholder="Enter your email"
              />
              {validationErrors?.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors?.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-primary">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                value={formData?.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary"
              >
                <option value="student">Student looking for housing</option>
                <option value="landlord">Landlord/Property owner</option>
                <option value="agent">Real estate agent</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData?.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary ${
                           validationErrors?.password ? 'border-red-500' : 'border-border'
                         }`}
                placeholder="Create a password"
              />
              {validationErrors?.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors?.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData?.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary ${
                           validationErrors?.confirmPassword ? 'border-red-500' : 'border-border'
                         }`}
                placeholder="Confirm your password"
              />
              {validationErrors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors?.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                       shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-secondary">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-border rounded-md 
                       shadow-sm text-sm font-medium text-text-primary bg-background hover:bg-secondary-100 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-text-secondary">
          <p>
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:text-primary-700 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;