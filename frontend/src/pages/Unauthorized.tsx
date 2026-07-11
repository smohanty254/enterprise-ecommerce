import { Typography } from '@mui/material';

const Unauthorized = () => {
  return (
    <Typography variant="h4" color="error" role="alert" sx={{ mt: 4 }}>
      403 - Access Denied
    </Typography>
  );
};

export default Unauthorized;
