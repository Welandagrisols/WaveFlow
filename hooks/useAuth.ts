
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Set demo user on mount
  useEffect(() => {
    setUser({
      id: 'demo-user',
      email: 'demo@yasinga.com', 
      user_metadata: {
        full_name: 'Demo User',
        avatar_url: null
      }
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo mode - simulate successful login
    const newUser = {
      id: 'demo-user',
      email: email,
      user_metadata: {
        full_name: 'Demo User',
        avatar_url: null
      }
    };
    setUser(newUser);
    return { data: { user: newUser }, error: null };
  };

  const signUp = async (email: string, password: string) => {
    // Demo mode - simulate successful signup
    return await signIn(email, password);
  };

  const signOut = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const getAccessToken = async () => {
    return null;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getAccessToken,
    isAuthenticated: !!user,
  };
}
