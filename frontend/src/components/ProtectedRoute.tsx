import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { type UserRole } from '../types/auth';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  console.log(allowedRoles);
  console.log(user?.roles);
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        role="alert"
        aria-busy="true"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress aria-label="Authenticating session" />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying credentials...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if user not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role requirements match user roles
  if (allowedRoles && !allowedRoles.includes(user.roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
