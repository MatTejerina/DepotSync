import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  Avatar,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MenuItems } from './MenuItems';
import Footer from './Footer';

const drawerWidth = 240;

const Dashboard = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [open, setOpen] = useState(!isMobile);
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    role: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        role: user.role || ''
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            DepotSync
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            backgroundColor: '#fff',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
          },
        }}
      >
        <Toolbar />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64,
              mb: 1,
              bgcolor: '#1976d2',
              fontSize: '1.5rem'
            }}
          >
            {userData.nombre?.[0]}{userData.apellido?.[0]}
          </Avatar>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              color: '#1976d2'
            }}
          >
            {`${userData.nombre} ${userData.apellido}`}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              backgroundColor: '#e3f2fd',
              px: 2,
              py: 0.5,
              borderRadius: '16px',
              mt: 0.5
            }}
          >
            {userData.role}
          </Typography>
        </Box>

        <List sx={{ flexGrow: 1, mt: 2 }}>
          <MenuItems userRole={userData.role} />
        </List>
      </Drawer>

      <Box 
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            flexGrow: 1
          }}
        >
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default Dashboard; 