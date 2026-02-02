import { useState, useEffect, createContext, useContext } from 'react';

interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  features: string[];
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

// Create context for tenant information
export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null
});

/**
 * Hook to access current tenant context
 * In a real app, this would be populated from JWT token or API call
 */
export const useTenant = () => {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};

/**
 * Custom hook for tenant management
 * This would typically decode tenant info from JWT or fetch from API
 */
export const useTenantState = (): TenantContextType => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, extract tenant from JWT token
    // For demo purposes, we'll simulate this
    const initializeTenant = async () => {
      try {
        // Simulate API call or JWT decode
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock tenant data (in real app, this comes from JWT or API)
        const mockTenant: Tenant = {
          id: 'tenant-123',
          name: 'Acme Corporation',
          plan: 'pro',
          features: ['task-management', 'team-collaboration', 'reporting']
        };
        
        setTenant(mockTenant);
      } catch (err) {
        setError('Failed to load tenant information');
      } finally {
        setLoading(false);
      }
    };

    initializeTenant();
  }, []);

  return { tenant, loading, error };
};