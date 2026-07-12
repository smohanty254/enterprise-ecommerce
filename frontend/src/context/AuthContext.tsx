/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, setAccessToken } from '../api/axios';
import { type User } from '../types/auth';
import { AuthContext } from './AuthContextObject';
import axios from 'axios';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(true);

  // Silent Initial Session check on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt a quiet refresh using the HttpOnly cookie
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(response.data.token);
      } catch (err) {
        // Safe to catch; implies user is completely logged out/guest
        setAccessToken(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch current profile using the access token
  const fetchCurrentUser = async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  };

  const {
    data: user,
    isLoading: isQueryLoading,
    error,
  } = useQuery<User>({
    queryKey: ['auth-user'],
    queryFn: fetchCurrentUser,
    retry: false, // Don't infinite retry if user is not authenticated
    enabled: !isInitializing,
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

  const combinedLoading = isInitializing || isQueryLoading;

  return (
    <AuthContext.Provider
      value={{ user: error ? null : user || null, isLoading: combinedLoading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
