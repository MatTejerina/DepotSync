import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/AdminProducts.css';

const EditUser = ({ open, onClose, user, onUserUpdated, currentUserRole }) => {
  const [editedUser, setEditedUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    role: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedUser({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        role: user.role || 'tecnico'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!editedUser.email || !editedUser.nombre || !editedUser.apellido) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      if (currentUserRole !== 'admin') {
        throw new Error('Solo los administradores pueden cambiar roles');
      }

      const userRef = doc(db, 'users', user.id);
      const updateData = {
        nombre: editedUser.nombre,
        apellido: editedUser.apellido,
        email: editedUser.email
      };

      if (currentUserRole === 'admin') {
        updateData.role = editedUser.role;
      }

      await updateDoc(userRef, updateData);

      onUserUpdated({
        ...user,
        ...updateData
      });
      onClose();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
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
          <h3>Editar Usuario</h3>
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
              value={editedUser.nombre}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div className="form-group">
            <TextField
              name="apellido"
              label="Apellido"
              value={editedUser.apellido}
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
              value={editedUser.email}
              onChange={handleChange}
              required
              fullWidth
              disabled
            />
          </div>

          {currentUserRole === 'admin' && (
            <div className="form-group">
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="role"
                  value={editedUser.role}
                  onChange={handleChange}
                  label="Rol"
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="tecnico">Técnico</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;