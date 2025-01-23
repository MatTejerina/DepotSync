import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Error = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      p={3}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Página no encontrada
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Volver al inicio
      </Button>
    </Box>
  );
};

export default Error;