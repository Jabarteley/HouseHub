import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import { useTheme } from '../../contexts/ThemeContext';

const Login = () => {
  const { signIn, signInWithGoogle, loading, error, isAuthenticated } = useAuth();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // Demo credentials for testing
  const demoCredentials = [
    { email: 'admin@estatehub.com', password: 'EstateHub2024!', role: 'Admin' },
    { email: 'landlord@estatehub.com', password: 'Landlord2024!', role: 'Landlord' },
    { email: 'agent@estatehub.com', password: 'Agent2024!', role: 'Agent' },
    { email: 'student@university.edu', password: 'Student2024!', role: 'Student' }
  ];

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(formData?.email, formData?.password);
      if (!error) {
        // Navigation will happen automatically via auth state change
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
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
            Sign in to EstateHub
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Or{' '}
            <Link
              to="/auth/signup"
              className="font-medium text-primary hover:text-primary-700 transition-colors duration-200"
            >
              create a new account
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
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Credentials */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="Info" size={20} className="text-blue-500" />
              <h3 className="ml-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Credentials
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
            >
              <Icon name={showCredentials ? "ChevronUp" : "ChevronDown"} size={16} />
            </button>
          </div>
          
          {showCredentials && (
            <div className="mt-3 space-y-2">
              {demoCredentials?.map((cred, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {cred?.role}: {cred?.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Password: {cred?.password}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials(cred?.email, cred?.password)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData?.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md 
                         focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                         transition-all duration-200 ease-out bg-background text-text-primary
                         placeholder-text-secondary"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
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
                  Signing in...
                </div>
              ) : (
                'Sign in'
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
              onClick={handleGoogleSignIn}
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
              Sign in with Google
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-text-secondary">
          <p>
            Don't have an account?{' '}
            <Link
              to="/auth/signup"
              className="font-medium text-primary hover:text-primary-700 transition-colors duration-200"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;