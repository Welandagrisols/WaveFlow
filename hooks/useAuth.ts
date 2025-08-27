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
          // Auto-create a default user for demo purposes
          const defaultUser: User = {
            id: 'demo-user-' + Date.now(),
            email: 'demo@yasinga.com',
            firstName: 'Demo',
            lastName: 'User',
            businessName: 'My Business'
          };
          setUser(defaultUser);
          localStorage.setItem('yasinga_user', JSON.stringify(defaultUser));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Fallback to creating a new user
        const fallbackUser: User = {
          id: 'demo-user-fallback',
          email: 'demo@yasinga.com',
          firstName: 'Demo',
          lastName: 'User',
          businessName: 'My Business'
        };
        setUser(fallbackUser);
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