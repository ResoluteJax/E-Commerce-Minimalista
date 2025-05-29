// frontend/src/pages/admin/AdminOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Para pegar o authToken

function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useCart();

  // Estados para atualização de status
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);

  // Efeito para buscar os detalhes do pedido
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!authToken) {
        setError("Autenticação necessária para ver detalhes do pedido.");
        setLoading(false);
        return;
      }
      if (!orderId) {
        setError("ID do pedido não fornecido.");
        setLoading(false);
        return;
      }

      const apiUrl = `http://localhost:5015/api/orders/${orderId}`;
      setLoading(true);
      setError(null); // Limpa erro anterior antes de nova busca
      setStatusUpdateError(null); // Limpa erro de atualização de status também

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
          if (response.status === 404) {
            throw new Error(`Pedido com ID ${orderId} não encontrado.`);
          }
          const errorText = await response.text();
          throw new Error(`Erro HTTP: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        setOrder(data);
        // setSelectedStatus(data.status); // Movido para o próximo useEffect
      } catch (err) {
        console.error(`Erro ao buscar detalhes do pedido ${orderId}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, authToken]); // Re-executa se orderId ou authToken mudar

  // Efeito para atualizar selectedStatus QUANDO o 'order' for carregado/modificado
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]); // Dependência: order

  // Função para lidar com a atualização do status
  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus || !authToken) {
      setStatusUpdateError("Informações insuficientes para atualizar o status.");
      return;
    }
    if (selectedStatus === order?.status) { // Verifica se o status é o mesmo
        setStatusUpdateError("O status selecionado é o mesmo status atual do pedido.");
        return;
    }


    setIsUpdatingStatus(true);
    setStatusUpdateError(null);
    const apiUrl = `http://localhost:5015/api/orders/${orderId}/status`;
    const statusDto = { newStatus: selectedStatus };

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusDto)
      });

      if (!response.ok) {
        let errorMsg = `Erro HTTP ao atualizar status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || (errorData.errors && errorData.errors.join(', ')) || (await response.text()) || errorMsg;
        } catch(e) {
            errorMsg = await response.text() || errorMsg;
        }
        throw new Error(errorMsg);
      }

      // Sucesso! Atualiza o estado do pedido localmente.
      setOrder(prevOrder => ({ ...prevOrder, status: selectedStatus }));
      alert("Status do pedido atualizado com sucesso!");

    } catch (err) {
      console.error("Erro ao atualizar status do pedido:", err);
      setStatusUpdateError(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  if (loading) {
    return <p>Carregando detalhes do pedido...</p>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Erro ao carregar detalhes do pedido: {error}</p>
        <Link to="/admin">Voltar para lista de pedidos</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p>Pedido não encontrado.</p>
        <Link to="/admin">Voltar para lista de pedidos</Link>
      </div>
    );
  }

  return (
    <div>
      <h3>Detalhes do Pedido #{order.id}</h3>
      <Link to="/admin">← Voltar para Lista de Pedidos</Link>
      <div style={{ marginTop: '1rem' }}>
        <p><strong>Data do Pedido:</strong> {new Date(order.orderDate).toLocaleString('pt-BR')}</p>
        <p><strong>Status Atual:</strong> <span style={{fontWeight: 'bold'}}>{order.status}</span></p>
        <p><strong>ID do Cliente:</strong> {order.customerId || 'N/A'}</p>
        <p><strong>Endereço de Entrega:</strong> {order.shippingAddress}</p>
        <p><strong>Valor Total:</strong> R$ {order.totalAmount.toFixed(2)}</p>

        <h4>Itens do Pedido:</h4>
        {order.items && order.items.length > 0 ? (
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {order.items.map(item => (
              <li key={item.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                <p><strong>Produto:</strong> {item.productName} (ID: {item.productId})</p>
                <p>Quantidade: {item.quantity}</p>
                <p>Preço Unitário: R$ {item.unitPrice.toFixed(2)}</p>
                <p>Subtotal: R$ {item.lineTotal.toFixed(2)}</p>
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

        {/* --- Seção para Atualizar Status --- */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h4>Alterar Status do Pedido</h4>
          <div>
            <label htmlFor="statusSelect" style={{marginRight: '10px'}}>Novo Status:</label>
            <select
              id="statusSelect"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: '8px', marginRight: '10px' }}
              disabled={isUpdatingStatus}
            >
              <option value="Pendente">Pendente</option>
              <option value="Processando">Processando</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus || selectedStatus === order.status}
              style={{ padding: '8px 12px' }}
            >
              {isUpdatingStatus ? 'Atualizando...' : 'Atualizar Status'}
            </button>
          </div>
          {statusUpdateError && <p style={{ color: 'red', marginTop: '10px' }}>Erro ao atualizar: {statusUpdateError}</p>}
        </div>
        {/* --- FIM: Seção para Atualizar Status --- */}

      </div>
      <div style={{marginTop: '20px'}}>
        <Link to="/admin">Voltar para Lista de Pedidos</Link>
      </div>
    </div>
  );
}

export default AdminOrderDetailPage;