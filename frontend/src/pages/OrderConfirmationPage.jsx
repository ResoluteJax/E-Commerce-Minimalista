// frontend/src/pages/OrderConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function OrderConfirmationPage() {
  const { orderId } = useParams(); // Pega o 'orderId' da URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
     useEffect(() => {
    const fetchOrderDetails = async () => {
      // Usa o endpoint GET /api/orders/{id} que acabamos de testar no backend
      const apiUrl = `http://localhost:5015/api/orders/${orderId}`;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Pedido com ID ${orderId} não encontrado.`);
          }
          throw new Error(`Erro HTTP: ${response.status}`);
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
    }
  }, [orderId]); // Re-executa se o orderId mudar

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
      <p><strong>Data do Pedido:</strong> {new Date(order.orderDate).toLocaleDateString('pt-BR')}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Endereço de Entrega:</strong> {order.shippingAddress}</p>

      <h3>Itens do Pedido:</h3>
      <ul>
        {order.items && order.items.map(item => (
          <li key={item.id} style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px' }}>
            <p><strong>{item.productName}</strong></p>
            <p>Quantidade: {item.quantity}</p>
            <p>Preço Unitário: R$ {item.unitPrice.toFixed(2)}</p>
            <p>Subtotal: R$ {item.lineTotal.toFixed(2)}</p>
          </li>
        ))}
      </ul>
      <hr />
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <h3>Valor Total: R$ {order.totalAmount.toFixed(2)}</h3>
      </div>
      <Link to="/">Voltar para a Página Inicial</Link>
    </div>
  );
}

export default OrderConfirmationPage;