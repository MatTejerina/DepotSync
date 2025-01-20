import React from 'react';
import { Box, Container, Typography, IconButton, Tooltip } from '@mui/material';
import { WhatsApp as WhatsAppIcon } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = '3816500851';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1976d2',
        color: 'white',
        position: 'relative',
        bottom: 0,
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" align="center">
            © {currentYear} DepotSync. Todos los derechos reservados.
          </Typography>
          
          <Tooltip title="Contactar por WhatsApp">
            <IconButton
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'white',
                '&:hover': { 
                  color: '#25D366' // Color verde de WhatsApp
                }
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;