// frontend/src/components/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Importa Link para voltar

function ProductDetail() {
  const { id } = useParams(); // Pega o ID da URL
  const [product, setProduct] = useState(null); // Estado para o produto (inicia nulo)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      
        const apiUrl = `http://localhost:5015/api/products/${id}`; // Use HTTP e a porta 5015
        
      try {
        setError(null);
        setLoading(true);
        const response = await fetch(apiUrl);

        if (!response.ok) {
          // Se a API retornar 404, consideramos como produto não encontrado
          if (response.status === 404) {
            throw new Error('Produto não encontrado.');
          }
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data); // Armazena os dados do produto no estado

      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]); // Dependência [id]: Re-executa o efeito se o ID na URL mudar

  // --- Renderização Condicional ---

  if (loading) {
    return <p>Carregando detalhes do produto...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro: {error}</p>;
  }

  // Tratamento caso o produto não seja encontrado (mesmo sem erro de rede)
  if (!product) {
     return <p>Produto não encontrado.</p>;
  }

  // --- Renderização dos Detalhes ---
  return (
    <div>
      {/* Link para voltar para a lista */}
      <Link to="/">← Voltar para a Lista</Link>

      <h2>{product.name}</h2>
      <img
        src={product.imageUrl || 'https://via.placeholder.com/300'} // Placeholder maior
        alt={product.name}
        style={{ maxWidth: '400px', height: 'auto', display: 'block', margin: '1rem 0' }}
      />
      <p>{product.description}</p>
      <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
        R$ {product.price.toFixed(2)}
      </p>
      {/* Outros detalhes ou botão de adicionar ao carrinho podem vir aqui */}
    </div>
  );
}

export default ProductDetail;