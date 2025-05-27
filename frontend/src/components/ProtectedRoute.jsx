// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProtectedRoute() {
  // Adicione loadingCart à desestruturação
  const { isAuthenticated, currentUser, loadingCart } = useCart();
  const location = useLocation();

  // Se o contexto ainda está carregando o estado inicial (incluindo currentUser do localStorage)
  // exibe um placeholder ou nada para evitar redirecionamento prematuro.
  if (loadingCart) {
    return <p>Verificando autenticação...</p>; // Ou null, ou um spinner
  }

  // Após o carregamento do contexto:
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Não autenticado, redirecionando para login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica se o usuário é Admin APÓS garantir que currentUser foi carregado
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('Admin');

  if (!isAdmin) {
    console.warn("ProtectedRoute: Acesso negado à rota admin. Usuário não é Admin:", currentUser);
    return <Navigate to="/" replace />; // Redireciona para home se não for admin
  }

  // Usuário autenticado E é Admin
  console.log("ProtectedRoute: Acesso admin permitido para:", currentUser);
  return <Outlet />;
}

export default ProtectedRoute;