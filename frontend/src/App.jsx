// frontend/src/App.jsx
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartIcon from './components/CartIcon';
import CartPage from './components/CartPage'; // Certifique-se que o caminho está correto (components ou pages)
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/admin/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import { useCart } from './context/CartContext';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategoryListPage from './pages/admin/AdminCategoryListPage';
import AdminCategoryForm from './pages/admin/AdminCategoryForm';
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
        {/* O componente <Routes> deve envolver TODAS as definições de <Route> */}
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rota Protegida para Admin - Layout principal para /admin */}
          <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminPage />}> {/* AdminPage como layout */}
          <Route index element={<p>Painel Administrativo. Selecione uma opção...</p>} />
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="products" element={<AdminProductListPage />} />
          <Route path="products/new" element={<AdminProductForm mode="create" />} />
          <Route path="products/edit/:productId" element={<AdminProductForm mode="edit" />} />
          <Route path="categories" element={<AdminCategoryListPage />} />
          
          <Route path="categories/new" element={<AdminCategoryForm mode="create" />} />
          <Route path="categories/edit/:categoryId" element={<AdminCategoryForm mode="edit" />} />
        </Route>
      </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;