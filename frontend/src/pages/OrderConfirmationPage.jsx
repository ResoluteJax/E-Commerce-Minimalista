// frontend/src/pages/OrderConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Para pegar o authToken

function OrderConfirmationPage() {
  const { orderId } = useParams(); // Pega o 'orderId' da URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useCart(); // Pega o token do contexto

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const apiUrl = `http://localhost:5015/api/orders/${orderId}`;
      setLoading(true);
      setError(null);

      const headers = {}; // Cria objeto de headers
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`; // Adiciona o token se existir
      }

      try {
        // Adiciona o objeto headers à chamada fetch
        const response = await fetch(apiUrl, { headers }); 

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Pedido com ID ${orderId} não encontrado.`);
          }
          // Tenta ler a mensagem de erro da API, se houver
          let errorMsg = `Erro HTTP: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = data.message || (data.errors && data.errors.join(', ')) || errorMsg;
          } catch(e) {
            // Se a resposta de erro não for JSON, usa o texto
            errorMsg = await response.text() || errorMsg;
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do pedido:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    } else {
      setError("ID do pedido não fornecido."); // Caso o orderId não esteja na URL
      setLoading(false);
    }
  }, [orderId, authToken]); // Re-executa se o orderId ou authToken mudar

  if (loading) {
    return <p>Carregando confirmação do pedido...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro ao carregar pedido: {error}</p>;
  }

  if (!order) {
    return <p>Detalhes do pedido não encontrados.</p>;
  }

  // Se chegou aqui, temos os detalhes do pedido
  return (
    <div>
      <h2>Pedido Realizado com Sucesso!</h2>
      <p>Obrigado pela sua compra!</p>
      <p><strong>Número do Pedido:</strong> #{order.id}</p>
      <p><strong>Data do Pedido:</strong> {new Date(order.orderDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Endereço de Entrega:</strong> {order.shippingAddress}</p>

      <h3>Itens do Pedido:</h3>
      {order.items && order.items.length > 0 ? (
        <ul>
          {order.items.map(item => (
            <li key={item.id} style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={item.imageUrl || 'https://via.placeholder.com/50'} 
                alt={item.productName} 
                style={{ width: '50px', height: '50px', marginRight: '10px', objectFit: 'cover' }} 
              />
              <div style={{flexGrow: 1}}>
                <p><strong>{item.productName}</strong></p>
                <p>Quantidade: {item.quantity}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p>Preço Unitário: R$ {item.unitPrice.toFixed(2)}</p>
                <p style={{fontWeight: 'bold'}}>Subtotal: R$ {item.lineTotal.toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Não há itens neste pedido.</p>
      )}
      <hr />
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <h3>Valor Total: R$ {order.totalAmount.toFixed(2)}</h3>
      </div>
      <Link to="/">Voltar para a Página Inicial</Link>
    </div>
  );
}

export default OrderConfirmationPage;