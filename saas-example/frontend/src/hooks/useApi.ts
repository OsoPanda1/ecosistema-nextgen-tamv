import { useState } from 'react';
import { useAuth } from './useAuth';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Request failed');
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    request,
    loading,
    error
  };
}
