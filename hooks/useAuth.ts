
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if supabase is configured
    if (!supabase) {
      // Try to get user from localStorage for demo mode
      const storedUser = localStorage.getItem('yasinga_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            businessName: session.user.user_metadata?.business_name || ''
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            businessName: session.user.user_metadata?.business_name || ''
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Clear localStorage
    localStorage.removeItem('yasinga_user');
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (supabase && user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: userData
        });
        if (error) {
          console.error('Error updating user:', error);
          return;
        }
        // Update local state
        setUser(prev => prev ? { ...prev, ...userData } : null);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      // Demo mode - update localStorage
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('yasinga_user', JSON.stringify(updatedUser));
      }
    }
  };

  return { 
    user, 
    loading, 
    logout, 
    updateUser,
    isAuthenticated: !!user,
    isLoading: loading
  };
};
