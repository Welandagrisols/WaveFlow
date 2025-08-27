
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@/shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch user data from Replit Auth API
  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          if (response.status === 401) return null;
          throw new Error('Failed to fetch user');
        }
        return response.json();
      } catch (error) {
        console.error('Auth fetch error:', error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setUser(userData || null);
    setLoading(isLoading);
  }, [userData, isLoading]);

  const signIn = async () => {
    window.location.href = '/api/login';
  };

  const signOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const getAccessToken = async () => {
    // Replit Auth uses session-based authentication, not tokens
    return null;
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    getAccessToken,
    isAuthenticated: !!user,
  };
}
