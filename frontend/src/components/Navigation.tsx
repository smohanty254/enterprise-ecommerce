import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router';

const Navigation = () => {
  const { user, logout } = useAuth();
  return (
    <AppBar position="static" component="nav" aria-label="Application Header">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          E-Commerce App
        </Typography>
      </Toolbar>
      <Button color="inherit" component={RouterLink} to="/">
        Home
      </Button>
      {user ? (
        <>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          {user.roles.includes('ADMIN') && (
            <Button color="inherit" component={RouterLink} to="/admin">
              Admin
            </Button>
          )}
          <Button
            color="secondary"
            variant="contained"
            onClick={logout}
            aria-label={`Log out ${user.fullName}`}
            sx={{ ml: 2 }}
          >
            Logout ({user.fullName.split(' ')[0]})
          </Button>
        </>
      ) : (
        <Button color="inherit" component={RouterLink} to="/login">
          Login
        </Button>
      )}
    </AppBar>
  );
};

export default Navigation;
