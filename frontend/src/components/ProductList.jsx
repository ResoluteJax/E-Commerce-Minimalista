// frontend/src/components/ProductList.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true); // Renomeado para clareza
  const [productsError, setProductsError] = useState(null);    // Renomeado para clareza
  const { refreshCart } = useCart();

  // Estados para categorias
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // '' representa "Todas as Categorias"
  const [loadingCategories, setLoadingCategories] = useState(true);
  // const [categoriesError, setCategoriesError] = useState(null); // Opcional, para erro específico de categorias

  // Busca categorias na montagem do componente
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('http://localhost:5015/api/categories');
        if (!response.ok) {
          throw new Error('Falha ao buscar categorias');
        }
        const data = await response.json();
        setCategories(data);
      } catch (catError) {
        console.error("Erro ao buscar categorias:", catError);
        // setCategoriesError(catError.message); // Define erro de categoria se necessário
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []); // Roda apenas uma vez na montagem

  // Busca produtos quando o componente monta OU quando selectedCategoryId muda
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    let apiUrl = 'http://localhost:5015/api/products';
    if (selectedCategoryId) { // Se uma categoria for selecionada, adiciona à URL
      apiUrl += `?categoryId=${selectedCategoryId}`;
    }
    // console.log("Fetching products from:", apiUrl); // Para debug

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar produtos: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProductsError(`Falha ao carregar produtos: ${error.message}`);
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedCategoryId]); // Dependência no selectedCategoryId

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Chama fetchProducts quando ele (ou suas dependências) mudam


  const handleAddToCart = async (event, productId) => {
    event.stopPropagation();
    event.preventDefault();
    const apiUrl = 'http://localhost:5015/api/cart/items';
    const itemToAdd = { productId: productId, quantity: 1 };
    // console.log('Adicionando ao carrinho:', itemToAdd);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemToAdd),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData}`);
      }
      // console.log('Produto adicionado/atualizado no carrinho!', itemToAdd);
      alert(`Produto ${productId} adicionado ao carrinho!`);
      await refreshCart();
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert(`Erro ao adicionar produto: ${error.message}`);
    }
  };

  // --- Renderização ---
  if (loadingCategories || loadingProducts) { // Mostra loading se categorias OU produtos estiverem carregando
    return <p>Carregando...</p>;
  }

  if (productsError) {
    return <p style={{ color: 'red' }}>{productsError}</p>;
  }

  return (
    <div>
      <h2>Lista de Produtos</h2>

      {/* Filtro de Categoria */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="category-filter" style={{ marginRight: '10px' }}>Filtrar por Categoria:</label>
        <select
          id="category-filter"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{ padding: '8px', minWidth: '200px' }}
        >
          <option value="">Todas as Categorias</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Produtos */}
      {products.length === 0 && !loadingProducts ? (
        <p>Nenhum produto encontrado para esta categoria ou em geral.</p>
      ) : (
        // Div que envolve todos os cards - MODIFICADO PARA USAR GRID
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', // Colunas responsivas
          gap: '1rem'
        }}>
          {products.map(product => (
            // Card do produto individual - width removido, será controlado pelo grid
            <div key={product.id} style={{
              border: '1px solid #ccc',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', flexGrow: 1 }}>
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '0.5rem' }}
                />
                <h3>{product.name}</h3>
                <p style={{ fontSize: '0.9em', color: '#555' }}>Categoria: {product.categoryName || 'Sem categoria'}</p>
                <p style={{ fontSize: '0.8em' }}>{product.description.substring(0, 60)}...</p>
                <p style={{ fontWeight: 'bold', marginTop: 'auto' }}>
                  R$ {product.price.toFixed(2)}
                </p>
              </Link>
              <button
                onClick={(e) => handleAddToCart(e, product.id)} // Assumindo que handleAddToCart está definido no componente
                style={{ marginTop: '10px', padding: '8px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
}

export default ProductList;