import { useEffect, useState } from "react";

// Simple user type for the application
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
    // Check for existing session in localStorage
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('yasinga_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const logout = () => {
    localStorage.removeItem('yasinga_user');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('yasinga_user', JSON.stringify(updatedUser));
    }
  };

  return { user, loading, logout, updateUser };
};