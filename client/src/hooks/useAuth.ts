
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase!.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Invalidate queries on auth change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          queryClient.invalidateQueries();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
    const result = await supabase!.auth.signInWithPassword({ email, password });
    if (result.error) {
      throw result.error;
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
    const result = await supabase!.auth.signUp({ 
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
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
    const result = await supabase!.auth.signOut();
    if (result.error) {
      throw result.error;
    }
    return result;
  };

  const getAccessToken = async () => {
    if (!isSupabaseConfigured) return null;
    const { data: { session } } = await supabase!.auth.getSession();
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
    isSupabaseConfigured,
  };
}
