// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Usaremos para pegar isAuthenticated

function ProtectedRoute() {
  const { isAuthenticated } = useCart();

   if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;