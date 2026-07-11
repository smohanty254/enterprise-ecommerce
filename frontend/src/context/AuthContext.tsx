import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, setAccessToken } from '../api/axios';
import { type User } from '../types/auth';
import { AuthContext } from './AuthContextObject';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Fetch current profile using the access token
  const fetchCurrentUser = async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  };

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ['auth-user'],
    queryFn: fetchCurrentUser,
    retry: false, // Don't infinite retry if user is not authenticated
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed on backend', e);
    } finally {
      setAccessToken(null);
      queryClient.setQueryData(['auth-user'], null);
      queryClient.clear();
    }
  };

  // Sync token expiration events with global client state
  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.setQueryData(['auth-user'], null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user: error ? null : user || null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
