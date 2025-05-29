// frontend/src/pages/admin/AdminProductListPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function AdminProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useCart();

  // fetchProducts agora usa useCallback para ser estável
  const fetchProductsCallback = useCallback(async () => {
    if (!authToken) {
      setError("Admin não autenticado ou token não encontrado.");
      setLoading(false);
      return;
    }
    const apiUrl = 'http://localhost:5015/api/products';
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Acesso não autorizado/negado: ${response.status}`);
        }
        const errorText = await response.text();
        throw new Error(`Erro HTTP: ${response.status} - ${errorText || response.statusText}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Erro ao buscar produtos (admin):", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]); // Depende de authToken

  useEffect(() => {
    fetchProductsCallback();
  }, [fetchProductsCallback]);


  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Tem certeza que deseja deletar o produto "${productName}" (ID: ${productId})?`)) {
      return;
    }
    if (!authToken) {
      setError("Admin não autenticado.");
      return;
    }
    const apiUrl = `http://localhost:5015/api/products/${productId}`;
    setError(null);
    // Adicionar um estado isDeleting para desabilitar o botão específico seria uma melhoria
    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) { // DELETE bem-sucedido geralmente é 204 No Content
        let errorMsg = `Erro HTTP ao deletar: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.title || errorData.message || (errorData.errors && Object.values(errorData.errors).flat().join(' ')) || errorMsg;
        } catch(e) {
            errorMsg = await response.text() || errorMsg;
        }
        throw new Error(errorMsg);
      }
      alert(`Produto "${productName}" deletado com sucesso!`);
      // Atualiza a lista localmente removendo o produto deletado
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      // Alternativamente, poderia chamar fetchProductsCallback() para rebuscar do servidor:
      // await fetchProductsCallback();
    } catch (err) {
      console.error(`Erro ao deletar produto ${productId}:`, err);
      setError(err.message);
    }
  };

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p style={{ color: 'red' }}>Erro ao carregar produtos: {error}</p>;

  return (
    <div>
      <h4>Gerenciar Produtos</h4>
      <Link to="/admin/products/new" style={{ marginBottom: '1rem', display: 'inline-block', padding: '8px 12px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        Adicionar Novo Produto
      </Link>
      {products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: 'grey' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Categoria</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Preço</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{product.id}</td>
                <td style={{ padding: '8px' }}>{product.name}</td>
                <td style={{ padding: '8px' }}>{product.categoryName || 'N/A'}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>R$ {product.price.toFixed(2)}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/admin/products/edit/${product.id}`} style={{ marginRight: '10px' }}>Editar</Link>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: '1em' }}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProductListPage;