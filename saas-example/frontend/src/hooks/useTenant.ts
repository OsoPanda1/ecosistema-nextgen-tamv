import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Tenant {
  id: string;
  name: string;
  plan: string;
  features: string[];
  status?: string;
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      // Load tenant from localStorage
      const storedTenant = localStorage.getItem('tenant');
      if (storedTenant) {
        try {
          const tenantData = JSON.parse(storedTenant);
          setTenant({
            id: tenantData.id,
            name: tenantData.name,
            plan: tenantData.plan,
            status: tenantData.status,
            features: getFeaturesByPlan(tenantData.plan)
          });
        } catch (error) {
          console.error('Failed to parse tenant data:', error);
        }
      }
    }
  }, [user, isAuthenticated]);

  function hasFeature(feature: string): boolean {
    return tenant?.features.includes(feature) ?? false;
  }

  function getFeaturesByPlan(plan: string): string[] {
    const planFeatures: Record<string, string[]> = {
      free: ['tasks', 'basic-support'],
      pro: ['tasks', 'analytics', 'api-access', 'priority-support'],
      enterprise: ['tasks', 'analytics', 'api-access', 'priority-support', 'custom-integrations', 'sla']
    };
    
    return planFeatures[plan] || planFeatures.free;
  }

  return {
    tenant,
    hasFeature
  };
}
