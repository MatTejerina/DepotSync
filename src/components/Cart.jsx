import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  Fab,
  Drawer,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';

const Cart = ({ items, onRemoveItem, onSubmitOrder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mostrar el cart en PC solo si hay items
  const shouldShowDesktopCart = !isMobile && items.length > 0;


  const cartContent = (
    <>
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>Carrito de Pedidos ({items.length})</span>
        {!isMobile && (
          <IconButton 
            size="small" 
            onClick={() => setIsOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Typography>
      <List sx={{ 
        width: '100%', 
        bgcolor: 'background.paper',
        overflowY: 'auto',
        maxHeight: isMobile ? 'calc(60vh - 120px)' : '400px',
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555'
        }
      }}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onRemoveItem(item.id)}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.light'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
              sx={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                    {`${item.quantity} ${item.material}`}
                  </Typography>
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary="No hay items en el carrito"
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItem>
        )}
      </List>
      <Box sx={{ 
        p: 2,
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'background.paper'
      }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onSubmitOrder}
          disabled={items.length === 0}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Enviar Pedido
        </Button>
      </Box>
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Fab
            color="primary"
            aria-label="cart"
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <Badge 
              badgeContent={items.length} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: -3,
                }
              }}
            >
              <ShoppingCartIcon />
            </Badge>
          </Fab>
          <Drawer
            anchor="bottom"
            open={isOpen}
            onClose={() => setIsOpen(false)}
            PaperProps={{
              sx: {
                maxHeight: '75vh',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
            {cartContent}
          </Drawer>
        </>
      ) : (
        // Cart para PC
        <>
          {!isOpen && items.length > 0 && (
            <Fab
              color="primary"
              aria-label="show cart"
              onClick={() => setIsOpen(true)}
              sx={{
                position: 'fixed',
                top: 80,
                right: 20,
                zIndex: 1000
              }}
            >
              <Badge 
                badgeContent={items.length} 
                color="error"
              >
                <ShoppingCartIcon />
              </Badge>
            </Fab>
          )}
          <Drawer
            anchor="right"
            open={isOpen && shouldShowDesktopCart}
            onClose={() => setIsOpen(false)}
            variant="persistent"
            PaperProps={{
              sx: {
                width: 360,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {cartContent}
          </Drawer>
        </>
      )}
    </>
  );
};

export default Cart; 