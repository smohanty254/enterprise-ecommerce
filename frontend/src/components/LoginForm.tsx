/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { api, setAccessToken } from '../api/axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button, Typography, Alert, Card, CardContent } from '@mui/material';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Location in LoginForm: ', location);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFields) => {
      const { data } = await api.post('/auth/login', credentials);
      return data; // NestJS returns structure like { token: "..." }
    },
    onSuccess: (data) => {
      setAccessToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      navigate(from, { replace: true });
    },
  });

  const onSubmit = (data: LoginFields) => {
    loginMutation.mutate(data);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
        }}
        component="section"
        aria-labelledby="login-title"
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            id="login-title"
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ textAlign: 'center' }}
          >
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
            {loginMutation.isError && (
              <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                Invalid email or password. Please try again.
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  'aria-invalid': errors.email ? 'true' : 'false',
                },
              }}
              {...register('email')}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  'aria-invalid': errors.password ? 'true' : 'false',
                },
              }}
              {...register('password')}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending}
              sx={{ mt: 3, mb: 2 }}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
