import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import SelectProducts from './pages/SelectProducts';
import History from './pages/History';
import AdminProducts from './pages/AdminProducts';
import Users from './pages/Users';
import Error from './pages/Error';
import Orders from './pages/Orders';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <SnackbarProvider maxSnack={3}>
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" /> : <Login />
          } 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
              <SelectProducts />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/history" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Tecnico']}>
              <History />
            </ProtectedRoute>
          } 
        />

        {/* Rutas de admin */}
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminProducts />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Orders />
            </ProtectedRoute>
          } 
        />

        {/* Ruta de error - solo si no coincide ninguna otra ruta */}
        <Route 
          path="*" 
          element={
            user ? <Error /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </SnackbarProvider>
  );
};

export default App;