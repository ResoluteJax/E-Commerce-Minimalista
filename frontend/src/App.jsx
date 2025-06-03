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
      {/* Início da Navbar Bootstrap */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4"> {/* mb-4 adiciona margem abaixo */}
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Meu E-commerce</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* Links adicionais da navbar podem vir aqui, ex: */}
              {/* <li className="nav-item">
                <Link className="nav-link" to="/all-products">Todos Produtos</Link>
              </li> */}
            </ul>
            {/* Itens à direita */}
            <div className="d-flex align-items-center">
              {isAuthenticated && currentUser ? (
                <>
                  {currentUser.roles && currentUser.roles.includes('Admin') && (
                    <Link className="nav-link" to="/admin" style={{ marginRight: '15px' }}>Admin</Link>
                  )}
                  <span className="navbar-text" style={{ marginRight: '15px' }}>
                    Olá, {currentUser.fullName}!
                  </span>
                  <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm" style={{ marginRight: '15px' }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="nav-link" to="/login" style={{ marginRight: '10px' }}>Login</Link>
                  <Link className="nav-link" to="/register" style={{ marginRight: '10px' }}>Registrar</Link>
                </>
              )}
              <CartIcon /> {/* Seu componente CartIcon pode precisar de ajustes de estilo para se encaixar bem */}
            </div>
          </div>
        </div>
      </nav>
      {/* Fim da Navbar Bootstrap */}

      <main className="container" style={{ paddingTop: '10px' }}>
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