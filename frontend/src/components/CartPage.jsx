// frontend/src/components/CartPage.jsx
import React, { useState /* Removido useEffect */ } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Hook para consumir o contexto


  function CartPage() {
  const { cart, loadingCart, cartError, refreshCart } = useCart();
  // Adicione este log:
  console.log('CartPage received context:', { cart, loadingCart, cartError });

  // Estados locais APENAS para controle da UI durante ações
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState(null); // Erro específico das ações PUT/DELETE

  // REMOVIDO: fetchCart() local e useEffect local que o chamava

  // --- Funções Handler agora usam refreshCart e setActionError ---

  const handleRemoveItem = async (productId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setActionError(null); // Limpa erro de ação anterior
    const apiUrl = `http://localhost:5015/api/cart/items/${productId}`;

    try {
      const response = await fetch(apiUrl, { method: 'DELETE' });
      if (!response.ok) {
        const errorText = await response.text(); // Pega texto do erro
        throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao remover item'}`);
      }
      console.log(`Item ${productId} removido`);
      await refreshCart(); // Chama refresh do contexto
    } catch (error) {
      console.error("Erro ao remover item:", error);
      setActionError(error.message); // Seta o erro da AÇÃO
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    // Validação básica da quantidade (pode ser mais robusta)
    if (isUpdating || !Number.isInteger(newQuantity) || newQuantity <= 0 || newQuantity > 100) {
        setActionError("Quantidade inválida."); // Seta erro local da ação
        // Não retorna aqui se isUpdating for true, apenas previne a chamada API
        if(!Number.isInteger(newQuantity) || newQuantity <= 0 || newQuantity > 100) return;
    };
    setIsUpdating(true);
    setActionError(null); // Limpa erro de ação anterior
    const apiUrl = `http://localhost:5015/api/cart/items/${productId}`;
    const updateDto = { quantity: newQuantity };

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateDto)
      });
      if (!response.ok) {
        const errorText = await response.text(); // Pega texto do erro
        throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao atualizar quantidade'}`);
      }
       console.log(`Item ${productId} quantidade atualizada para ${newQuantity}`);
      await refreshCart(); // Chama refresh do contexto
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      setActionError(error.message); // Seta o erro da AÇÃO
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Renderização agora usa 'loadingCart', 'cartError', e 'cart' do contexto ---
  if (loadingCart) {
    return <p>Carregando carrinho...</p>;
  }

  // Mostra erro principal do carregamento do carrinho OU erro da última ação
  const displayError = cartError || actionError;

  // Se o carrinho está vazio ou não foi encontrado (mesmo sem erro de carregamento)
   if (!cart || !cart.items || cart.items.length === 0) {
        return (
          <div>
            <h2>Seu Carrinho</h2>
            {displayError && <p style={{ color: 'red' }}>Erro: {displayError}</p>}
            <p>Seu carrinho está vazio.</p>
            <Link to="/">Continuar comprando</Link>
          </div>
        );
      }



  // Renderiza a lista se o carrinho foi carregado
  return (
    <div>
      <h2>Seu Carrinho</h2>
      {displayError && <p style={{ color: 'red' }}>Erro: {displayError}</p>} {/* Mostra erro se houver */}
      <ul>
        {cart.items.map(item => (
          <li key={item.id} style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={item.imageUrl || 'https://via.placeholder.com/50'}
              alt={item.productName}
              style={{ width: '50px', height: '50px' }}
            />
            <div style={{ flexGrow: 1 }}>
              <strong>{item.productName}</strong> <br />
              Preço Unitário: R$ {item.unitPrice.toFixed(2)}
            </div>
            {/* Controles de Quantidade */}
            <div>
              Quantidade:
              <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1 || isUpdating} style={{ margin: '0 5px' }}>-</button>
              {item.quantity}
              <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} disabled={isUpdating || item.quantity >= 100} style={{ margin: '0 5px' }}>+</button> {/* Adicionado limite maximo */}
            </div>
            <div style={{ fontWeight: 'bold', minWidth: '100px', textAlign: 'right' }}>
              Subtotal: R$ {item.lineTotal.toFixed(2)}
            </div>
            {/* Botão Remover */}
            <button onClick={() => handleRemoveItem(item.productId)} disabled={isUpdating} style={{ color: 'red', marginLeft: '10px' }}>Remover</button>
          </li>
        ))}
      </ul>
      <hr />
      <div>
        <h3>Resumo do Pedido</h3>
        <p>Total de Itens: {cart.totalItemCount}</p>
        <p>Valor Total: R$ {cart.totalAmount.toFixed(2)}</p>
        {/* TODO: Botão para Checkout */}
      </div>
       <Link to="/">Continuar comprando</Link>
    </div>
  );
}

export default CartPage;