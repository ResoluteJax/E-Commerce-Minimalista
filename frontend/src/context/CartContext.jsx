// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrigido para importação nomeada

// 1. Cria o Contexto
const CartContext = createContext();

// 2. Cria o Provedor do Contexto
export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true); // Renomeado para clareza
  const [cartError, setCartError] = useState(null);   // Renomeado para clareza

  // Estados para Autenticação
  const [currentUser, setCurrentUser] = useState(null);
  // Inicializa authToken do localStorage. Se não existir, será null.
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));

  // Função para buscar os dados do carrinho da API
  const fetchCart = useCallback(async () => {
    const apiUrl = 'http://localhost:5015/api/cart';
    // console.log('CartContext: Fetching cart data...'); // Para debug

    // Não reseta loadingCart no início de cada fetch, apenas na carga inicial do provider
    // setCartError(null); // Limpa erro anterior ANTES de tentar

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (response.status === 404) {
          setCart(null);
          setItemCount(0);
          setCartError(null); // Não é um erro da app se o carrinho não existe
          return;
        }
        throw new Error(`Erro HTTP ao buscar carrinho: ${response.status}`);
      }
      const data = await response.json();
      // console.log('CartContext: Fetched cart data:', data); // Para debug
      setCart(data);
      setItemCount(data.totalItemCount || 0);
      setCartError(null);
    } catch (err) {
      console.error("CartContext: Erro ao buscar carrinho:", err);
      setCartError(err.message);
      setCart(null);
      setItemCount(0);
    } finally {
      // setLoadingCart(false) será chamado no useEffect inicial
    }
  }, []); // useCallback com dependência vazia, fetchCart não muda

  useEffect(() => {
    console.log("CartProvider: Montando e carregando estado inicial.");
    const storedToken = localStorage.getItem('authToken');
    const expiresOnString = localStorage.getItem('authTokenExpiresOn');
    // ... (resto da leitura do localStorage) ...

    let isTokenValid = false;
    let userRolesOnInit = []; // Para armazenar roles na inicialização

    if (storedToken && expiresOnString) {
        // ... (lógica de verificação de expiração) ...
        if (isTokenValid) { // Se o token ainda é válido após checagem de expiração
            try {
                const decodedToken = jwtDecode(storedToken);
                const roleClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                if (roleClaim) {
                    userRolesOnInit = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
                }
                 console.log("CartProvider Init: Token Decodificado do localStorage, Roles:", userRolesOnInit);
            } catch (e) {
                console.error("CartProvider Init: Erro ao decodificar token do localStorage", e);
                // Token inválido ou malformado, tratar como não autenticado
                isTokenValid = false; 
            }
        }
    }

    // Limpa localStorage se token não for mais válido após decodificação
    if (!isTokenValid) {
        localStorage.removeItem('authToken');
        // ... remover outros itens ...
    }


    if (isTokenValid && userId && userEmail && userFullName) {
        setCurrentUser({ 
            id: userId, 
            email: userEmail, 
            fullName: userFullName, 
            roles: userRolesOnInit // <-- Adiciona roles ao currentUser
        });
        setAuthToken(storedToken);
    } else {
        setCurrentUser(null);
        setAuthToken(null);
    }

    fetchCart().finally(() => {
        setLoadingCart(false);
    });

}, [fetchCart]);


 const loginUser = useCallback(async (authData) => {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('authUserId', authData.userId);
    localStorage.setItem('authUserEmail', authData.email);
    localStorage.setItem('authUserFullName', authData.fullName);
    localStorage.setItem('authTokenExpiresOn', authData.expiresOn);

    let userRoles = [];
    if (authData.token) {
        try {
            const decodedToken = jwtDecode(authData.token);
            // A claim de role pode ser uma string única ou um array de strings
            const roleClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (roleClaim) {
                userRoles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
            }
            console.log("CartContext: Token Decodificado, Roles:", userRoles);
        } catch (e) {
            console.error("CartContext: Erro ao decodificar token", e);
        }
    }

    setCurrentUser({
        id: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        roles: userRoles // <-- Armazena as roles
    });
    setAuthToken(authData.token);
    console.log("CartContext: Usuário logado, token e roles setados.");
    await fetchCart();
}, [fetchCart]);

  const logoutUser = useCallback(async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
    localStorage.removeItem('authUserEmail');
    localStorage.removeItem('authUserFullName');
    localStorage.removeItem('authTokenExpiresOn');

    setCurrentUser(null);
    setAuthToken(null);
    console.log("CartContext: Usuário deslogado, token removido.");
    await fetchCart(); // Rebusca o carrinho (será um carrinho de guest/anônimo)
  }, [fetchCart]);

  // O valor fornecido pelo contexto
  const value = {
    cart,
    itemCount,
    loadingCart,
    cartError,
    refreshCart: fetchCart,

    currentUser,
    authToken,
    isAuthenticated: !!authToken, // Booleano derivado
    loginUser,
    logoutUser
  };

  // console.log('CartProvider providing value:', value); // Para debug, se necessário

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