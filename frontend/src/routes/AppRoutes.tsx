import { BrowserRouter, Route, Routes } from 'react-router'; // Fixed package target
import Navigation from '../components/Navigation';
import { Container, Typography } from '@mui/material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import { LoginForm } from '../components/LoginForm';
import Unauthorized from '../pages/Unauthorized';
import AdminPanel from '../pages/AdminPanel';
import type React from 'react';

// Using parentheses () instead of curly braces {} creates an implicit return
const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Navigation />
    <Container component="main" id="main-content" maxWidth="lg">
      <Routes>
        <Route
          path="/"
          element={
            <Typography variant="h4" sx={{ mt: 4 }}>
              Welcome to E-commerce API Store
            </Typography>
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Container>
  </BrowserRouter>
);

export default AppRoutes;
