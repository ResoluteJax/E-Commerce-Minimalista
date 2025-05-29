// frontend/src/pages/admin/AdminOrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Ajuste o caminho se necessário

function AdminOrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useCart(); // Para enviar o token na requisição

  useEffect(() => {
    const fetchOrders = async () => {
      if (!authToken) {
        setError("Usuário não autenticado ou token não encontrado.");
        setLoading(false);
        return;
      }

      const apiUrl = 'http://localhost:5015/api/orders'; // Endpoint GET /api/orders
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

        const data = await response.json(); // Esperamos um array de OrderDto
        setOrders(data);
      } catch (err) {
        console.error("Erro ao buscar pedidos (admin):", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]); // Re-executa se o authToken mudar

  if (loading) {
    return <p>Carregando pedidos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro ao carregar pedidos: {error}</p>;
  }

  return (
    <div>
      <h3>Gerenciamento de Pedidos</h3>
      {orders.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: 'grey' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>ID Pedido</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Data</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Cliente ID</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>End. Entrega</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Valor Total</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{order.id}</td>
                <td style={{ padding: '8px' }}>{new Date(order.orderDate).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '8px' }}>{order.customerId || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{order.shippingAddress}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>R$ {order.totalAmount.toFixed(2)}</td>
                <td style={{ padding: '8px' }}>{order.status}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/admin/orders/${order.id}`}>Ver Detalhes</Link>
                  {/* Futuramente: Botão para mudar status */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminOrderListPage;