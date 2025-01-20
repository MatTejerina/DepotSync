import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import Register from '../components/Register';
import '../styles/Login.css';
import { IconButton, InputAdornment } from '@mui/material';
import { Lock, LockOpen } from '@mui/icons-material';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Primero autenticamos con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Luego buscamos la información adicional en Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const userInfo = {
          email: data.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          role: userData.role
        };
        
        // Guardamos la información en localStorage
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('token', await userCredential.user.getIdToken());
        
        enqueueSnackbar('Inicio de sesión exitoso', { variant: 'success' });
        navigate('/');
      } else {
        enqueueSnackbar('No se encontraron datos del usuario', { variant: 'error' });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      enqueueSnackbar('Error al iniciar sesión. Verifica tus credenciales.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "El email es requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido"
                }
              })}
              placeholder="Ingresa tu email"
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password", {
                  required: "La contraseña es requerida"
                })}
                placeholder="Ingresa tu contraseña"
              />
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                className="password-toggle"
              >
                {showPassword ? <Lock /> : <LockOpen />}
              </IconButton>
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="register-link">
            <p>
              ¿No tienes una cuenta?{' '}
              <span 
                onClick={() => setOpenRegister(true)}
                style={{ 
                  color: '#1976d2', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </form>
      </div>

      <Register 
        open={openRegister} 
        onClose={() => setOpenRegister(false)} 
      />
    </div>
  );
};

export default Login;