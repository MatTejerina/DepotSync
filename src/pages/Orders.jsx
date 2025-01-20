import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon,
  TaskAlt as TaskAltIcon,
  HighlightOff as HighlightOffIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DeleteOutline as DeleteOutlineIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  doc, 
  deleteDoc, 
  addDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import ConfirmDialog from '../components/ConfirmDialog';

const TimelineOrder = ({ order, handleCompleteOrder, handleDeleteOrder }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TimelineContent sx={{ py: '12px', px: { xs: 1, sm: 2 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: 6
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            cursor: 'pointer'
          }}
          onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="h6">
              Patente: {order.patente}
            </Typography>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Completar Pedido">
              <IconButton 
                onClick={() => handleCompleteOrder(order)}
                sx={{ 
                  color: '#28a745',
                  boxShadow: 'none',
                  '&:hover': { 
                    color: '#218838'
                  }
                }}
              >
                <CheckCircleOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancelar Pedido">
              <IconButton 
                onClick={() => handleDeleteOrder(order.id)}
                sx={{ 
                  color: '#ff3d00',
                  boxShadow: 'none',
                  '&:hover': { 
                    color: '#d32f2f'
                  }
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: { xs: 'block', sm: 'none' },
                mb: 2 
              }}
            >
              {format(order.timestamp.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              flexWrap: 'wrap'
            }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography>
                {`${order.solicitante?.nombre || ''} ${order.solicitante?.apellido || ''}`}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1}>
              {order.items.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: { xs: 1.5, sm: 2 },
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    mb: 1
                  }}>
                    <InventoryIcon sx={{ 
                      mr: 2, 
                      color: 'primary.main',
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }} />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {item.quantity} {item.material}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </Paper>
    </TimelineContent>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    // Crear la query
    const q = query(
      collection(db, 'orders'),
      orderBy('timestamp', 'asc')
    );

    // Establecer el listener en tiempo real
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to orders:", error);
        setError("Error al cargar los pedidos");
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []); // Solo se ejecuta una vez al montar el componente

  const handleCompleteOrder = async (order) => {
    try {
      // Primero, agregar al historial
      const historialRef = collection(db, 'historial');
      await addDoc(historialRef, {
        ...order,
        completedAt: new Date(),
        status: 'completed'
      });

      // Luego, eliminar de pedidos activos
      const orderRef = doc(db, 'orders', order.id);
      await deleteDoc(orderRef);
      
      enqueueSnackbar('Pedido completado y movido al historial', { 
        variant: 'success' 
      });
      
      // Ya no necesitamos fetchOrders() porque onSnapshot actualizará automáticamente
    } catch (error) {
      console.error("Error completing order:", error);
      enqueueSnackbar('Error al completar el pedido', { variant: 'error' });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const orderRef = doc(db, 'orders', orderToDelete);
      await deleteDoc(orderRef);
      enqueueSnackbar('Pedido eliminado correctamente', { variant: 'success' });
    } catch (error) {
      console.error("Error deleting order:", error);
      enqueueSnackbar('Error al eliminar el pedido', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Container 
        maxWidth="md"
        sx={{ 
          mt: 4, 
          px: { xs: 1, sm: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            mb: 2,
            textAlign: 'center'
          }}
        >
          Pedidos Realizados
        </Typography>

        <Timeline 
          sx={{ 
            p: { xs: 0, sm: 2 },
            [`& .MuiTimelineItem-root:before`]: {
              flex: { xs: 0, sm: 0 }
            },
            width: '100%',
            maxWidth: '800px',
            margin: '0',
            [`& .MuiTimelineContent-root`]: {
              px: { xs: 1, sm: 2 },
            },
            [`& .MuiTimelineSeparator-root`]: {
              mr: 2
            }
          }}
          position="left"
        >
          {orders.map((order) => (
            <TimelineItem key={order.id}>
              <TimelineOppositeContent 
                sx={{ 
                  display: { xs: 'none', sm: 'block' }
                }}
                color="text.secondary"
              >
                {format(order.timestamp.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <LocalShippingIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              
              <TimelineOrder 
                order={order}
                handleCompleteOrder={handleCompleteOrder}
                handleDeleteOrder={handleDeleteOrder}
              />
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este pedido? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default Orders;