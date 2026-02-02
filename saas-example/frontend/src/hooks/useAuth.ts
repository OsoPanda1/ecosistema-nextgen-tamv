import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context for authentication
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Custom hook for authentication management
 * In production, integrate with Auth0, AWS Cognito, or similar
 */
export const useAuthState = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
          // In real app, validate token with backend
          // For demo, we'll simulate a valid session
          const mockUser: User = {
            id: 'user-456',
            email: 'john@acme.com',
            name: 'John Doe',
            roles: ['user', 'admin'],
            tenantId: 'tenant-123'
          };
          
          setUser(mockUser);
          setToken(savedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In real app, call authentication API
      // For demo, simulate successful login
      if (email && password) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiIsImVtYWlsIjoiam9obkBhY21lLmNvbSIsInRlbmFudElkIjoidGVuYW50LTEyMyIsInJvbGVzIjpbInVzZXIiLCJhZG1pbiJdLCJpYXQiOjE3MDk1NTM2MDAsImV4cCI6MTcwOTY0MDAwMH0.demo-signature';
        
        const mockUser: User = {
          id: 'user-456',
          email,
          name: 'John Doe',
          roles: ['user', 'admin'],
          tenantId: 'tenant-123'
        };

        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('auth_token', mockToken);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return {
    user,
    token,
    loading,
    login,
    logout
  };
};