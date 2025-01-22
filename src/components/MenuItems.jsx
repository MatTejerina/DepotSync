import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const menuConfig = {
  Admin: [
    { path: '/', icon: <HomeIcon />, text: 'Realizar Pedido' },
    { path: '/admin/products', icon: <InventoryIcon />, text: 'Materiales' },
    { path: '/admin/orders', icon: <InventoryIcon />, text: 'Pedidos' },
    { path: '/admin/users', icon: <GroupIcon />, text: 'Usuarios' },
    { path: '/history', icon: <HistoryIcon />, text: 'Historial' }
  ],
  Tecnico: [
    { path: '/', icon: <HomeIcon />, text: 'Realizar Pedido' },
    { path: '/history', icon: <HistoryIcon />, text: 'Historial' }
  ]
};

export const MenuItems = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = menuConfig[userRole] || [];

  return (
    <Box sx={{ width: '100%' }}>
      {menuItems.map(({ path, icon, text }) => (
        <ListItem 
          key={path} 
          disablePadding
          sx={{
            mb: 0.5,
            borderRadius: '0 20px 20px 0',
            overflow: 'hidden',
            maxWidth: '90%'
          }}
        >
          <ListItemButton
            selected={location.pathname === path}
            onClick={() => navigate(path)}
            sx={{
              minHeight: 48,
              borderRadius: '0 20px 20px 0',
              '&.Mui-selected': {
                backgroundColor: '#1976d2',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&.Mui-selected': {
                  backgroundColor: '#1565c0',
                },
              },
              transition: 'all 0.2s ease-in-out',
              transform: 'translateX(0)',
              '&:hover': {
                transform: 'translateX(8px)',
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 56,
                color: location.pathname === path ? 'white' : '#666',
                transition: 'color 0.2s ease-in-out'
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText 
              primary={text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === path ? 600 : 400,
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
      <Divider sx={{ my: 2, width: '90%', mx: 'auto' }} />
      <ListItem 
        disablePadding
        sx={{
          mb: 0.5,
          borderRadius: '0 20px 20px 0',
          overflow: 'hidden',
          maxWidth: '90%'
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 48,
            borderRadius: '0 20px 20px 0',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              transform: 'translateX(8px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon sx={{ minWidth: 56, color: '#d32f2f' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Cerrar Sesión"
            sx={{
              color: '#d32f2f'
            }}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  );
}; 