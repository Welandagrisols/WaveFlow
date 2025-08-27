
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        if (!supabase) {
          // In development without Supabase, create mock user
          if (process.env.NODE_ENV === 'development' && mounted) {
            const mockUser = {
              id: 'dev-user-123',
              email: 'dev@example.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              aud: 'authenticated',
              role: 'authenticated'
            } as User;
            setUser(mockUser);
            setLoading(false);
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth session error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes only if supabase is available
    let subscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (mounted) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        }
      );
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut
  };
}
