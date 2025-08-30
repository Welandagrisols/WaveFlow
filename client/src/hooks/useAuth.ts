
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Force loading to false if supabase is not available
    if (!supabase) {
      console.log('Supabase not configured, setting loading to false');
      setUser(null);
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth timeout - setting loading to false');
      setUser(null);
      setLoading(false);
    }, 2000);

    // Get initial session
    (supabase as any).auth.getSession().then(({ data: { session }, error }: any) => {
      clearTimeout(timeout);
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Session loaded:', !!session?.user);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error: any) => {
      clearTimeout(timeout);
      console.error('Failed to get session:', error);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = (supabase as any).auth.onAuthStateChange(
      (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Invalidate queries on auth change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          queryClient.invalidateQueries();
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const result = await (supabase as any).auth.signInWithPassword({ email, password });
    if (result.error) {
      throw result.error;
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const result = await (supabase as any).auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (result.error) {
      throw result.error;
    }
    return result;
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    const result = await (supabase as any).auth.signOut();
    if (result.error) {
      throw result.error;
    }
    return result;
  };

  const getAccessToken = async () => {
    if (!supabase) return null;
    const { data: { session } } = await (supabase as any).auth.getSession();
    return session?.access_token || null;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getAccessToken,
    isAuthenticated: !!user,
    isSupabaseConfigured: !!supabase,
  };
}
