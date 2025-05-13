// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartIcon from './components/CartIcon'; // Importado
import CartPage from './components/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import './App.css';

function App() {
  return (
    <>
      {/* Cabeçalho simples */}
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Meu E-commerce Minimalista</h1>
        <CartIcon /> 
      </header>

      <main> {/* Conteúdo principal */}
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} /> 
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;