import { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Your Supabase client

// Define the shape of our User, including the role from our 'profiles' table
export interface AppUser {
  id: string;
  email?: string;
  name: string;
  role: 'citizen' | 'technician';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ data: any; error: any; }>;
  logout: () => Promise<any>;
  // You can add a register function here later
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
      }
    });

    // Listen for auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user);
        } else {
          setUser(null); // User logged out
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Helper function to get our custom profile data from the 'profiles' table
  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', authUser.id)
        .single(); // We expect only one row

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: authUser.email,
          name: data.name || '', // Ensure name is not null
          role: data.role as 'citizen' | 'technician',
        });
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
      // This is where RLS policies can cause an error
    }
  };

  // Login function that uses Supabase
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user) {
        console.log('Logging in as', data.user.email);
        // fetchUserProfile will be called by the onAuthStateChange listener
    }
    
    return { data, error };
  };

  // Logout function that uses Supabase
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};