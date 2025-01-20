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
  Collapse,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSnackbar } from 'notistack';

const OrderDetails = ({ items }) => (
  <Table size="small" aria-label="purchases">
    <TableHead>
      <TableRow>
        <TableCell>Material</TableCell>
        <TableCell align="right">Cantidad</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item, index) => (
        <TableRow key={index}>
          <TableCell component="th" scope="row">
            {item.material}
          </TableCell>
          <TableCell align="right">{item.quantity}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const SolicitanteGroup = ({ solicitante, orders, onDelete, isAdmin }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {`${solicitante.nombre} ${solicitante.apellido}`}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {orders.map((order, index) => (
                <Box key={order.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patente: {order.patente} - {format(order.timestamp.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </Typography>
                    {isAdmin && (
                      <IconButton
                        aria-label="delete"
                        onClick={() => onDelete(order.id)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.dark'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <OrderDetails items={order.items} />
                  {index < orders.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'Admin';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let q;
    setLoading(true);
    
    try {
      if (isAdmin) {
        // Admin ve todas las órdenes
        q = query(
          collection(db, 'historial'),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Técnico solo ve sus órdenes por nombre
        q = query(
          collection(db, 'historial'),
          where('solicitante.nombre', '==', user.nombre)
        );
      }

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const ordersData = querySnapshot.docs
            .map(doc => ({
              ...doc.data(),
              id: doc.id
            }))
            .filter(order => 
              order.status === 'completed' && 
              (!isAdmin ? order.solicitante.apellido === user.apellido : true)
            );
          
          setOrders(ordersData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error in snapshot listener:', error);
          setError("Error al cargar el historial. Por favor, espera un momento mientras se configura la base de datos.");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setError("Error al configurar la consulta");
      setLoading(false);
    }
  }, [isAdmin, user.nombre, user.apellido]);

  const handleDelete = (recordId) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const recordRef = doc(db, 'historial', recordToDelete);
      await deleteDoc(recordRef);
      enqueueSnackbar('Registro eliminado correctamente', { variant: 'success' });
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      enqueueSnackbar('Error al eliminar el registro', { variant: 'error' });
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

  // Agrupar pedidos por solicitante
  const groupedOrders = orders.reduce((acc, order) => {
    const key = `${order.solicitante.nombre}_${order.solicitante.apellido}`;
    if (!acc[key]) {
      acc[key] = {
        solicitante: order.solicitante,
        orders: []
      };
    }
    acc[key].orders.push(order);
    return acc;
  }, {});

  return (
    <>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            px: { xs: 2, sm: 0 },
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Historial de Pedidos
          {!isAdmin && " - Mis Pedidos"}
        </Typography>
        
        <Box sx={{ 
          width: '100%', 
          overflowX: 'auto',
          boxShadow: 1,
          borderRadius: 1,
          backgroundColor: 'background.paper'
        }}>
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableBody>
                {Object.values(groupedOrders).map((group) => (
                  <SolicitanteGroup 
                    key={`${group.solicitante.nombre}_${group.solicitante.apellido}`}
                    solicitante={group.solicitante}
                    orders={group.orders}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este registro del historial? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default History;