import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  fullName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  async function getToken(): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token available');
    }
    return token;
  }

  function login(token: string, userData: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    setUser(null);
    setIsAuthenticated(false);
  }

  return {
    user,
    isAuthenticated,
    loading,
    getToken,
    login,
    logout
  };
}
