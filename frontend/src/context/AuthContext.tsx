/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, setAccessToken } from '../api/axios';
import { type User } from '../types/auth';
import { AuthContext } from './AuthContextObject';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to instantly seed context state right after a manual login action
  const initializeSession = (token: string, userPayload: User) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    queryClient.setQueryData(['auth-user'], userPayload);
  };

  // Silent Initial Session check on app mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Attempt a quiet refresh using the HttpOnly cookie
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (isMounted) {
          setAccessToken(response.data.token);
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (isMounted) {
          // Safe to catch; implies user is completely logged out/guest
          setAccessToken(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
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
    enabled: !isInitializing && isAuthenticated,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
  });

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed on backend', e);
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      queryClient.setQueryData(['auth-user'], null);
      queryClient.clear();
    }
  };

  // Sync token expiration events with global client state
  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      queryClient.setQueryData(['auth-user'], null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [queryClient]);

  // Hard blocking overlaying until boot initialization completes
  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
        role="alert"
        aria-busy="true"
      >
        <CircularProgress aria-label="Loading workspace configuration" />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Connecting to secure session...
        </Typography>
      </Box>
    );
  }

  const activeUser = error || !isAuthenticated ? null : user || null;

  return (
    <AuthContext.Provider
      value={{ user: activeUser, isLoading: isQueryLoading, logout, initializeSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
