// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartIcon from './components/CartIcon'; // Importado
import CartPage from './components/CartPage';
import './App.css';

function App() {
  return (
    <>
      {/* Cabeçalho simples */}
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Meu E-commerce Minimalista</h1>
        <CartIcon /> {/* <-- Adicionado aqui */}
      </header>

      <main> {/* Conteúdo principal */}
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} /> {/* <-- Adicione esta rota */}
        </Routes>
      </main>
    </>
  );
}

export default App;