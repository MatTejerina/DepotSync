import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const ProductCard = ({ selectedPatente, onAddToCart, cartItems }) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const timeoutsRef = useRef({}); // Guarda los timeouts por producto

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(product => product.stock === 'disponible');

        productsData.sort((a, b) => {
          if (a.categoria === 'seriado' && b.categoria !== 'seriado') return -1;
          if (a.categoria !== 'seriado' && b.categoria === 'seriado') return 1;
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        });

        setProducts(productsData);
        
        const initialQuantities = {};
        productsData.forEach(product => {
          initialQuantities[product.id] = 0;
        });
        setQuantities(initialQuantities);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: value
    }));

    // Limpiar timeout anterior si existe
    if (timeoutsRef.current[productId]) {
      clearTimeout(timeoutsRef.current[productId]);
    }

    // Si la cantidad es mayor a 0, iniciar timeout para mostrar notistack
    if (value > 0) {
      timeoutsRef.current[productId] = setTimeout(() => {
        // Si el producto NO está en el carrito, mostrar notistack
        if (!cartItems.some(item => item.id === productId)) {
          const product = products.find(p => p.id === productId);
          enqueueSnackbar(
            `Seleccionaste ${value} ${product.material}. Recuerda agregarlo al carrito.`,
            { variant: 'warning', autoHideDuration: 2000 }
          );
        }
      }, 2000);
    }
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id];
    if (quantity > 0) {
      // Limpiar timeout si existe (el usuario sí agregó al carrito)
      if (timeoutsRef.current[product.id]) {
        clearTimeout(timeoutsRef.current[product.id]);
        delete timeoutsRef.current[product.id];
      }
      onAddToCart({
        ...product,
        quantity
      });
      setQuantities(prev => ({
        ...prev,
        [product.id]: 0
      }));
    }
  };

  const getQuantityOptions = (maximo) => {
    const options = [];
    for (let i = 0; i <= maximo; i++) {
      options.push(i);
    }
    return options;
  };

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  return (
    <Grid container spacing={2}>
      {products.map(product => {
        const isInCart = cartItems.some(item => item.id === product.id);
        const quantityOptions = getQuantityOptions(product.maximo);

        return (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                <img
                  src={product.imagen}
                  alt={product.material}
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 1,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.material}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    display: 'inline-block',
                    backgroundColor: product.stock === 'disponible' ? '#2e7d32' : '#d32f2f',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    mb: 2,
                    textTransform: 'capitalize'
                  }}
                >
                  {product.stock}
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Cantidad</InputLabel>
                  <Select
                    value={quantities[product.id] || 0}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    disabled={isInCart}
                    label="Cantidad"
                  >
                    {quantityOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Máximo permitido: {product.maximo}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleAddToCart(product)}
                  disabled={quantities[product.id] === 0 || isInCart}
                  sx={{ mt: 2 }}
                >
                  {isInCart ? 'Ya en el carrito' : 'Agregar al carrito'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProductCard;