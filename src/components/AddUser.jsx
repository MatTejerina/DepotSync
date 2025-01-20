import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import '../styles/AdminProducts.css';

const AddUser = ({ open, onClose, onUserAdded, currentUserRole }) => {
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validaciones
      if (!newUser.email || !newUser.nombre || !newUser.apellido || !newUser.password) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      if (newUser.password !== newUser.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (newUser.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      // Agregar usuario a Firestore con los campos específicos
      const docRef = await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        role: currentUserRole === 'Admin' ? 'Tecnico' : 'Tecnico',
        createdAt: new Date().toISOString()
      });

      // Notificar al componente padre
      onUserAdded({
        id: docRef.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        role: 'Tecnico'
      });

      // Resetear formulario y cerrar modal
      setNewUser({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      onClose();
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Agregar Nuevo Usuario</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <div className="form-group">
            <TextField
              name="nombre"
              label="Nombre"
              value={newUser.nombre}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div className="form-group">
            <TextField
              name="apellido"
              label="Apellido"
              value={newUser.apellido}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div className="form-group">
            <TextField
              name="email"
              label="Email"
              type="email"
              value={newUser.email}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div className="form-group">
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              value={newUser.password}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div className="form-group">
            <TextField
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              value={newUser.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;