// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';


// 1. Cria o Contexto
const CartContext = createContext();

// 2. Cria o Provedor do Contexto
export function CartProvider({ children }) {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true); // Loading inicial
  const [error, setError] = useState(null); // Erro na busca do carrinho
  const [cart, setCart] = useState(null);

  // Função para buscar os dados do carrinho da API (usando useCallback para otimização)
  const fetchCart = useCallback(async () => {
    const apiUrl = 'http://localhost:5015/api/cart';
    // console.log('CartContext: Fetching cart data...'); // Log para debug
    // Não reseta loading/error aqui para evitar piscar em re-fetches
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (response.status === 404) {
          setItemCount(0); // Carrinho não existe = 0 itens
          setCart(null); // Limpa o carrinho se não encontrado
          setError(null); // Não é um erro do app se o carrinho não existe
          return;
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('CartContext: Fetched data:', data);

      setCart(data);

      setItemCount(data.totalItemCount || 0);
      setError(null); // Limpa erros anteriores se sucesso
    } catch (err) {
      console.error("CartContext: Erro ao buscar carrinho:", err);
      setError(err.message);
      setItemCount(0); // Zera contagem em caso de erro
      setCart(null); // Limpa o carrinho em caso de erro
    } finally {
       // Só desativa o loading inicial na primeira vez
       if(loading) setLoading(false);
    }
  }, []); // Dependência em 'loading' para o finally funcionar na carga inicial

  useEffect(() => {
    // Este log rodará sempre que o estado 'cart' FOR REALMENTE ALTERADO
    console.log('CartProvider: cart state CHANGED to:', cart);
  }, [cart]); // A dependência [cart] garante que rode apenas quando 'cart' mudar
  


  // Busca inicial quando o provedor montar
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // Dependência no fetchCart (definido com useCallback)

  // O valor fornecido pelo contexto: a contagem e a função para re-buscar
  const value = {
    cart,
    itemCount,
    loadingCart: loading, // Renomeado para não conflitar
    cartError: error,    // Renomeado para não conflitar
    refreshCart: fetchCart // Expõe a função para re-buscar
  };


// ADICIONE ESTE LOG AQUI:
console.log('CartProvider providing value:', value);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 3. Cria um Hook customizado para consumir o contexto mais facilmente
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}