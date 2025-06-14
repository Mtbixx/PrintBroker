import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'printer';
  phone?: string;
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxNumber?: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'printer' | 'admin';
  companyName?: string;
  companyAddress?: string;
  phone?: string;
  taxNumber?: string;
  website?: string;
  profileImageUrl?: string;
  creditBalance?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'suspended';
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/user');

        // No longer checking for 401 directly as apiRequest will throw if not ok
        // The retry logic below will handle unauthorized cases
        return response; // apiRequest already returns JSON
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          console.log('Authentication failed: Unauthorized');
          return null; // Not authenticated - this is normal
        }
        console.error('Authentication request failed:', error);
        throw error; // Re-throw other errors
      }
    },
    retry: (failureCount, error) => {
      console.log('Auth query retry:', { failureCount, error });
      if (error instanceof Error && error.message.includes("401")) {
        console.log('Unauthorized error, not retrying');
        return false;
      }
      return failureCount < 2; // Retry other errors up to 2 times
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await apiRequest('POST', '/api/auth/login', {
        email: credentials.username,
        password: credentials.password
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      if (data.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 100);
      } else if (data.user?.role) {
        const redirectUrls = {
          customer: '/customer-dashboard',
          printer: '/printer-dashboard',
          admin: '/admin-dashboard'
        };

        const redirectUrl = redirectUrls[data.user.role as keyof typeof redirectUrls] || '/customer-dashboard';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });

  const register = useMutation({
    mutationFn: async (registerData: RegisterData) => {
      return await apiRequest('POST', '/api/auth/register', registerData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      // Use apiRequest for logout if it's a POST, otherwise direct fetch
      return await apiRequest('POST', '/api/logout', {}); // Assuming logout is now POST
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('Logout error:', error);
      queryClient.clear();
      window.location.href = '/';
    }
  });

  const isAuthenticated = !!user && !error;

  console.log('useAuth state:', {
    user,
    isLoading,
    error,
    isAuthenticated
  });

  const checkSession = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refetch,
    checkSession,
    error,
  };
};