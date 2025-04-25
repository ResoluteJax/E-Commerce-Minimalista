// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom'; 
import ProductList from './components/ProductList';   
import ProductDetail from './components/ProductDetail'; 
import './App.css';

function App() {
  return (
    <>
      <h1>Meu E-commerce Minimalista</h1>

      <Routes> {/* Área onde as rotas serão renderizadas */}
        <Route path="/" element={<ProductList />} /> {/* Rota Raiz: mostra a lista */}
        <Route path="/products/:id" element={<ProductDetail />} /> {/* Rota de Detalhe */}
        {/* Outras rotas (carrinho, checkout) podem ser adicionadas aqui depois */}
      </Routes>
    </>
  );
}

export default App;