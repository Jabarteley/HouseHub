import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  // Separate async operations object
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();
        
        if (error) {
          console.error('Profile loading error:', error);
          return;
        }
        
        setUserProfile(data);
      } catch (err) {
        console.error('Profile loading exception:', err);
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // Protected auth handlers - MUST remain synchronous
  const authStateHandlers = {
    onChange: (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id); // Fire-and-forget
      } else {
        profileOperations?.clear();
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session);
    });

    // Listen for auth changes - CRITICAL: Never modify this callback signature
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    );

    return () => subscription?.unsubscribe?.();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || '',
            role: userData?.role || 'student'
          }
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err?.message);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err?.message);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase?.auth?.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      setError(err?.message);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location?.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err?.message);
      return { data: null, error: err };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();

      if (error) throw error;
      
      setUserProfile(data);
      return { data, error: null };
    } catch (err) {
      setError(err?.message);
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isLandlord: userProfile?.role === 'landlord',
    isAgent: userProfile?.role === 'agent',
    isStudent: userProfile?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
