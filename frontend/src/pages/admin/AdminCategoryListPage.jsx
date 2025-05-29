// frontend/src/pages/admin/AdminCategoryListPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Para authToken

function AdminCategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useCart();

  // fetchCategories agora usa useCallback para ser estável e poder ser chamada por handleDelete
  const fetchCategoriesCallback = useCallback(async () => {
    if (!authToken) {
      setError("Admin não autenticado ou token não encontrado.");
      setLoading(false);
      return;
    }

    const apiUrl = 'http://localhost:5015/api/categories';
    setLoading(true); // Reinicia o loading ao buscar
    setError(null);   // Limpa erros anteriores

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar categorias: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Erro ao buscar categorias (admin):", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]); // Depende de authToken

  useEffect(() => {
    fetchCategoriesCallback();
  }, [fetchCategoriesCallback]); // Chama na montagem e se authToken mudar (via fetchCategoriesCallback)


  // Função para deletar categoria
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${categoryName}" (ID: ${categoryId})? Isso pode definir produtos associados como 'sem categoria'.`)) {
      return;
    }

    if (!authToken) {
      setError("Admin não autenticado para deletar categoria.");
      return;
    }

    const apiUrl = `http://localhost:5015/api/categories/${categoryId}`;
    setError(null); // Limpa erro anterior

    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) { // DELETE bem-sucedido é 204 No Content
        let errorMsg = `Erro HTTP ao deletar categoria: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.title || (errorData.errors && Object.values(errorData.errors).flat().join(' ')) || errorMsg;
        } catch(e) {
            errorMsg = await response.text() || errorMsg;
        }
        throw new Error(errorMsg);
      }

      alert(`Categoria "${categoryName}" deletada com sucesso!`);
      // Re-busca as categorias para atualizar a lista
      await fetchCategoriesCallback(); // Chama a função memoizada

    } catch (err) {
      console.error(`Erro ao deletar categoria ${categoryId}:`, err);
      setError(err.message);
    }
  };


  if (loading) {
    return <p>Carregando categorias...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro ao carregar ou modificar categorias: {error}</p>;
  }

  return (
    <div>
      <h4>Gerenciar Categorias</h4>
      <Link
        to="/admin/categories/new"
        style={{ marginBottom: '1rem', display: 'inline-block', padding: '8px 12px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
      >
        Adicionar Nova Categoria
      </Link>
      {categories.length === 0 ? (
        <p>Nenhuma categoria encontrada.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: 'grey' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{category.id}</td>
                <td style={{ padding: '8px' }}>{category.name}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/admin/categories/edit/${category.id}`} style={{ marginRight: '10px' }}>Editar</Link>
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
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

export default AdminCategoryListPage;