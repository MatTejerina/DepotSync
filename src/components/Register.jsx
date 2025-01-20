import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import '../styles/Login.css';
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Register = ({ open, onClose }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        role: 'Tecnico',
        createdAt: new Date().toISOString()
      });

      onClose();
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent style={{ padding: 0 }}>
        <div className="login-box" style={{ margin: '20px' }}>
          <h2>Registrar Usuario</h2>
          <form onSubmit={handleSubmit(onSubmit)} style={{ gap: '10px' }}>
            <div className="input-group">
              <label htmlFor="register-nombre">Nombre</label>
              <input
                id="register-nombre"
                name="nombre"
                type="text"
                {...register("nombre", {
                  required: "El nombre es requerido"
                })}
                placeholder="Ingresa tu nombre"
                disabled={loading}
                className={errors.nombre ? "error-input" : ""}
              />
              {errors.nombre && (
                <span className="error-text">{errors.nombre.message}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="register-apellido">Apellido</label>
              <input
                id="register-apellido"
                name="apellido"
                type="text"
                {...register("apellido", {
                  required: "El apellido es requerido"
                })}
                placeholder="Ingresa tu apellido"
                disabled={loading}
                className={errors.apellido ? "error-input" : ""}
              />
              {errors.apellido && (
                <span className="error-text">{errors.apellido.message}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                {...register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
                placeholder="Ingresa tu email"
                autoComplete="email"
                disabled={loading}
                className={errors.email ? "error-input" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email.message}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="register-password">Contraseña</label>
              <div className="password-input-container">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres"
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
                      message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&.)"
                    }
                  })}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                  className={errors.password ? "error-input" : ""}
                />
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  className="password-toggle"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="register-confirm-password">Confirmar Contraseña</label>
              <div className="password-input-container">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: value => value === watch('password') || "Las contraseñas no coinciden"
                  })}
                  placeholder="Confirma tu contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                  className={errors.confirmPassword ? "error-input" : ""}
                />
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  className="password-toggle"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="login-button"
              style={{ marginTop: '10px' }}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>

            <button 
              type="button"
              onClick={onClose}
              className="register-button"
            >
              Cancelar
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Register;