import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const [hasAccess, setHasAccess] = useState(null);
  
  useEffect(() => {
    const checkAccess = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setHasAccess(false);
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || !allowedRoles.includes(user.role)) {
        setHasAccess(false);
        return;
      }

      setHasAccess(true);
    };

    checkAccess();
  }, [allowedRoles]); // Solo se ejecuta cuando cambian los roles permitidos

  if (hasAccess === null) {
    return null; // O un componente de loading
  }

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard>{children}</Dashboard>;
};

export default ProtectedRoute; 