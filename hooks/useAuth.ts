import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // Assuming supabase client is exported from here
import { useQuery } from '@tanstack/react-query';

// Simple user type for the application
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      // Use Supabase client-side auth instead of API
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const logout = async () => {
    await supabase.auth.signOut();
    // Optionally clear local storage if you're managing user state there as well
    localStorage.removeItem('yasinga_user');
    // Depending on how you handle state, you might want to reset it here or let the query refetch
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const { data: updatedUser, error } = await supabase.auth.updateUser({
        data: userData
      });
      if (error) {
        console.error('Error updating user:', error);
        return;
      }
      // Supabase might return the updated user in the data
      // If not, you might need to refetch or manually update your local state
      // For simplicity, let's assume we update local state directly if the update call succeeds without error
      // In a real app, you'd likely want to refetch or have a more robust state management
      if (updatedUser) {
        setUser(updatedUser); // Assuming the returned user object contains all necessary fields
        localStorage.setItem('yasinga_user', JSON.stringify(updatedUser));
      } else {
        // If updateUser doesn't return the full user object, you might need to refetch
        // For now, we'll assume it's handled by the query refetching after a mutation
      }
    }
  };

  // If you need to manage local state for immediate UI updates before query refetch,
  // you can use useState as in the original, but ensure it's synced with Supabase data.
  // For this correction, we'll rely on the query's data and isLoading/error states.

  return { user, loading: isLoading, logout, updateUser, error };
};