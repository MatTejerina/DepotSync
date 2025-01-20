import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card as MuiCard,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useTheme
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/SelectProducts.css';
import ProductCard from '../components/Card';
import Cart from '../components/Cart';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const SelectProducts = () => {
  const [selectedPatente, setSelectedPatente] = useState('');
  const [showMaterials, setShowMaterials] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isWithinHours, setIsWithinHours] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const checkBusinessHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const isWeekday = now.getDay() !== 0 && now.getDay() !== 6;
      const isBusinessHour = hour >= 8 && hour < 14;
      return isWeekday && isBusinessHour;
    };

    setIsWithinHours(checkBusinessHours());
  }, []);

  const handleLogoutAndRedirect = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/login');
      enqueueSnackbar('Sesión cerrada correctamente', { 
        variant: 'success',
        autoHideDuration: 2000
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      enqueueSnackbar('Error al cerrar sesión', { 
        variant: 'error',
        autoHideDuration: 2000
      });
    }
  };

  if (!isWithinHours) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 3,
            p: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <ErrorOutlineIcon 
            sx={{ 
              fontSize: 80,
              color: theme.palette.error.main
            }} 
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Fuera de Horario
          </Typography>
          <Typography variant="h6" color="text.secondary">
            El sistema está disponible de lunes a viernes de 8:00 a 14:00 hs.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Por favor, intente nuevamente dentro del horario establecido.
          </Typography>
          <Button
            variant="contained"
            onClick={handleLogoutAndRedirect}
            sx={{ mt: 2 }}
          >
            Volver al Inicio
          </Button>
        </Box>
      </Container>
    );
  }

  const handlePatenteChange = (event) => {
    setSelectedPatente(event.target.value);
    setShowMaterials(false);
    setCartItems([]);
  };

  const handleContinue = () => {
    if (selectedPatente) {
      setShowMaterials(true);
    }
  };

  const handleAddToCart = (product) => {
    setCartItems(prev => [...prev, product]);
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleSubmitOrder = async () => {
    try {
      if (cartItems.length === 0) {
        enqueueSnackbar('El carrito está vacío', { variant: 'warning' });
        return;
      }

      // Obtener el usuario actual del localStorage o de donde lo tengas guardado
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      const orderData = {
        patente: selectedPatente,
        items: cartItems,
        timestamp: new Date(),
        status: 'pending',
        solicitante: {
          nombre: currentUser?.nombre || 'No especificado',
          apellido: currentUser?.apellido || 'No especificado'
        }
      };

      // Guardar en Firestore
      const orderRef = collection(db, 'orders');
      const docRef = await addDoc(orderRef, orderData);

      console.log('Pedido guardado con ID:', docRef.id);
      
      // Mostrar notificación de éxito
      enqueueSnackbar('Pedido enviado correctamente', { 
        variant: 'success',
        autoHideDuration: 2000,
        onClose: () => {
          // Limpiar el carrito
          setCartItems([]);
          // Navegar a la página de Orders
          navigate('/orders');
        }
      });
      
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      enqueueSnackbar('Error al enviar el pedido: ' + error.message, { 
        variant: 'error',
        autoHideDuration: 4000
      });
    }
  };

  const patentes = [
    'VP', 'VQ', 'JX', 'JY', 'JZ', 'KT', 'KW',
    'KY', 'LH', 'LS', 'MA', 'VT', 'VU', 'VW', 'VV',
    'VX', 'XA', 'XS', 'XT', 'XV', 'XU', 'YG',
    'VY', 'YA', 'YJ', 'YC', 'XX', 'YF', 'MU', 'ME'
  ].sort().map(patente => ({
    id: patente,
    label: `Móvil ${patente}`
  }));

  const tomorrow = addDays(new Date(), 1);
  const formattedTomorrow = format(tomorrow, "EEEE d 'de' MMMM", { locale: es });

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        mt: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 4
      }}>
        {/* Tarjeta de Bienvenida */}
        <Paper 
          elevation={3}
          className="welcome-container"
          sx={{
            p: 3,
            width: '100%',
            background: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            ¡Bienvenido!
          </Typography>
          <Typography variant="subtitle1" align="center">
            Para comenzar, selecciona la patente del móvil para el cual necesitas materiales para el {formattedTomorrow}
          </Typography>
        </Paper>

        {/* Tarjeta de Selección de Patente */}
        <MuiCard 
          className="patente-card"
          sx={{ 
            width: '100%',
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              alignItems: 'center'
            }}>
              <DirectionsCarIcon sx={{ fontSize: 60, color: '#6f86d6' }} />
              
              <FormControl fullWidth>
                <InputLabel id="patente-label">Seleccionar Patente</InputLabel>
                <Select
                  labelId="patente-label"
                  value={selectedPatente}
                  label="Seleccionar Patente"
                  onChange={handlePatenteChange}
                  sx={{ 
                    minWidth: 200,
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {patentes.map((patente) => (
                    <MenuItem 
                      key={patente.id} 
                      value={patente.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <DirectionsCarIcon sx={{ fontSize: 20 }} />
                      {patente.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                onClick={handleContinue}
                disabled={!selectedPatente}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3da8d0 0%, #5a6eb8 100%)',
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0'
                  }
                }}
              >
                Continuar
              </Button>
            </Box>
          </CardContent>
        </MuiCard>

        {/* Contenedor para la selección de materiales */}
        {showMaterials && (
          <Box sx={{ width: '100%' }} className="materials-container">
            <Typography variant="h5" gutterBottom align="center">
              Selección de Materiales para Móvil {selectedPatente}
            </Typography>
            <ProductCard 
              selectedPatente={selectedPatente} 
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
            />
          </Box>
        )}

        {showMaterials && (
          <Cart
            items={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onSubmitOrder={handleSubmitOrder}
          />
        )}
      </Box>
    </Container>
  );
};

export default SelectProducts;