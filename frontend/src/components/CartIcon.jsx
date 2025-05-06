// frontend/src/components/CartIcon.jsx
import React from 'react'; // Removido
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Hook para consumir o contexto

function CartIcon() {
  // Obtém os dados DIRETAMENTE do contexto compartilhado
  const { itemCount, loadingCart, cartError } = useCart();


  // Estilo básico para o ícone/link
  const linkStyle = {
    textDecoration: 'none',
    color: 'blue',
    border: '1px solid blue',
    padding: '5px 10px',
    borderRadius: '5px',
    marginLeft: '20px'
  };

  // Lógica de renderização baseada no contexto
  if (loadingCart) {
      // Exibe algo enquanto o contexto carrega inicialmente
      return <span style={linkStyle}>Carrinho (...)</span>;
  }
  if (cartError) {
      // Exibe algo se houve erro ao carregar o carrinho no contexto
      return <span style={linkStyle} title={cartError}>Carrinho (?)</span>;
  }

  // Renderização principal usando itemCount do contexto
  return (
    <Link to="/cart" style={linkStyle} title="Ver Carrinho">
      🛒 Carrinho ({itemCount})
    </Link>
  );
}

export default CartIcon;