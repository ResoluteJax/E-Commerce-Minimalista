// frontend/src/App.jsx
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartIcon from './components/CartIcon';
import CartPage from './components/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useCart } from './context/CartContext';
import './App.css';

function App() {
  const { currentUser, isAuthenticated, logoutUser } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px 20px',
        borderBottom: '1px solid #eee'
      }}>
        <h1>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Meu E-commerce Minimalista
          </Link>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && currentUser ? (
            <>
              <span style={{ marginRight: '15px' }}>Olá, {currentUser.fullName}!</span>
              {/* Verifica se o usuário é Admin para mostrar o link */}
              {currentUser.roles && currentUser.roles.includes('Admin') && (
                <Link to="/admin" style={{ marginRight: '15px', textDecoration: 'none' }}>Admin</Link>
              )}
              <button onClick={handleLogout} style={{ marginRight: '15px', padding: '5px 10px', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '10px', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ marginRight: '10px', textDecoration: 'none' }}>Registrar</Link>
            </>
          )}
          <CartIcon />
        </div>
      </header>

      <main style={{ padding: '0 20px 20px 20px' }}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rota Protegida para Admin */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<AdminPage />} /> {/* Renderiza AdminPage em /admin */}
            {/* Outras futuras rotas de admin podem ser aninhadas aqui, ex: */}
            {/* <Route path="gerenciar-produtos" element={<AdminManageProducts />} /> */}
          </Route>

        </Routes>
      </main>
    </>
  );
}

export default App;