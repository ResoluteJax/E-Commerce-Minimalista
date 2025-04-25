// frontend/src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 

function ProductList() {
  // Estado para armazenar a lista de produtos
  const [products, setProducts] = useState([]);
  // Estado para indicar se os dados estão sendo carregados
  const [loading, setLoading] = useState(true);
  // Estado para armazenar possíveis erros da API
  const [error, setError] = useState(null);

  // useEffect para buscar os dados da API quando o componente montar
  useEffect(() => {
    // Define a função assíncrona para buscar os produtos
    const fetchProducts = async () => {
      // IMPORTANTE: Substitua 5XXX pela porta HTTPS correta da sua API .NET!
      const apiUrl = 'http://localhost:5015/api/products';

      try {
        setError(null); // Limpa erros anteriores
        setLoading(true); // Inicia o carregamento

        const response = await fetch(apiUrl);

        // Verifica se a resposta da API foi bem-sucedida (status 2xx)
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json(); // Converte a resposta para JSON
        setProducts(data); // Atualiza o estado com os produtos recebidos

      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError(`Falha ao carregar produtos: ${error.message}`); // Armazena a mensagem de erro
      } finally {
        setLoading(false); // Finaliza o carregamento (com sucesso ou erro)
      }
    };

    fetchProducts(); // Chama a função de busca
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez (na montagem)

  // --- Renderização Condicional ---

  // Se estiver carregando, exibe mensagem de loading
  if (loading) {
    return <p>Carregando produtos...</p>;
  }

  // Se ocorreu um erro, exibe a mensagem de erro
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // Se não está carregando, não deu erro, mas não há produtos, exibe mensagem
  if (products.length === 0) {
    return <p>Nenhum produto encontrado.</p>;
  }

  // NOVO return (quando products.length > 0)
return (
    <div>
     <h2>Lista de Produtos</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {products.map(product => (
            // Envolve o card do produto com o Link
            <Link key={product.id} to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
                <h3>{product.name}</h3> {/* O nome agora está dentro do link */}
                <p>{product.description.substring(0, 60)}...</p>
                <p style={{ fontWeight: 'bold' }}>
                  R$ {product.price.toFixed(2)}
                </p>
              </div>
            </Link> // Fecha o Link
          ))}
        </div>
    </div>
  );
}

export default ProductList;