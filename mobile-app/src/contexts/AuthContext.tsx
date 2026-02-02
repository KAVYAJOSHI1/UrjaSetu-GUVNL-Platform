import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Your Supabase client

// Mock types for local usage
export type User = {
  id: string;
  email?: string;
  user_metadata: {
    [key: string]: any;
  };
  role?: string;
};
export type Session = {
  access_token: string;
  token_type: string;
  user: User | null;
};

// Define the shape of our User, including the role from our 'profiles' table
export interface AppUser {
  id: string;
  email?: string;
  name: string;
  role: 'citizen' | 'lineman';
  phone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ data: any; error: any; }>;
  logout: () => Promise<any>;
  register: (email: string, password: string, name: string, phone: string, role: string) => Promise<{ data: any; error: any; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
      if (session) {
        fetchUserProfile((session as any).user);
      }
    });

    // Listen for auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
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
        .select('id, name, role, phone')
        .eq('id', authUser.id)
        .single(); // We expect only one row

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: authUser.email,
          name: data.name || '', // Ensure name is not null
          role: data.role as 'citizen' | 'lineman',
          phone: data.phone,
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

    if (data.session) {
      console.log('Logging in as', data.user.email);
      setSession(data.session);
      await fetchUserProfile(data.user);
    }

    return { data, error };
  };

  // Logout function that uses Supabase
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    return { error };
  };

  const register = async (email: string, password: string, name: string, phone: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
        },
      },
    });

    // Note: You should handle profile creation trigger on the backend or here if no trigger exists.
    // Assuming a trigger exists on auth.users insert to create profile.

    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        login,
        logout,
        register,
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