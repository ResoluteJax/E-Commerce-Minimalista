// frontend/src/pages/AdminPage.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Adicionado Outlet

function AdminPage() {
  return (
    <div>
      <h2>Painel Administrativo</h2>
      <p>Bem-vindo à área administrativa!</p>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/admin/orders" style={{ marginRight: '15px' }}>Gerenciar Pedidos</Link>
        <Link to="/admin/products" style={{ marginRight: '15px' }}>Gerenciar Produtos</Link>
        <Link to="/admin/categories">Gerenciar Categorias</Link> {/* <-- ADICIONAR LINK */}
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default AdminPage;