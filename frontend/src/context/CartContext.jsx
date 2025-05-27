// frontend/src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Cria o Contexto
const CartContext = createContext();

// 2. Cria o Provedor do Contexto
export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState(null);

  // Estados para Autenticação
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));

  // Função para buscar os dados do carrinho da API
  const fetchCart = useCallback(async () => {
    const apiUrl = 'http://localhost:5015/api/cart';
    // console.log('CartContext: Fetching cart data...');

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if (response.status === 404) {
          setCart(null);
          setItemCount(0);
          setCartError(null);
          return;
        }
        const errorText = await response.text();
        throw new Error(`Erro HTTP ao buscar carrinho: ${response.status} - ${errorText || response.statusText}`);
      }
      const data = await response.json();
      // console.log('CartContext: Fetched cart data:', data);
      setCart(data);
      setItemCount(data.totalItemCount || 0);
      setCartError(null);
    } catch (err) {
      console.error("CartContext: Erro ao buscar carrinho:", err);
      setCartError(err.message);
      setCart(null);
      setItemCount(0);
    }
  }, []);

  // Efeito para carregar usuário do localStorage e buscar carrinho inicial
  useEffect(() => {
    console.log("CartProvider: Montando e carregando estado inicial.");
    const storedToken = localStorage.getItem('authToken');
    const expiresOnString = localStorage.getItem('authTokenExpiresOn');
    const userId = localStorage.getItem('authUserId');
    const userEmail = localStorage.getItem('authUserEmail');
    const userFullName = localStorage.getItem('authUserFullName');

    let isTokenValid = false;
    let userRolesOnInit = [];

    if (storedToken && expiresOnString) {
      const expiresOnDate = new Date(expiresOnString);
      console.log("CartProvider Init: Token ExpiresOn Date:", expiresOnDate); // Log de data
      console.log("CartProvider Init: Current Date:", new Date()); // Log de data
      if (expiresOnDate > new Date()) {
        isTokenValid = true;
        try {
          const decodedToken = jwtDecode(storedToken);
          console.log("CartProvider Init: Decoded Token Object from localStorage:", decodedToken);
          // CORREÇÃO AQUI: Usar 'role' como nome da claim
          const roleClaim = decodedToken['role'];
          console.log("CartProvider Init: Extracted Role Claim from localStorage:", roleClaim);
          if (roleClaim) {
            userRolesOnInit = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
          }
          console.log("CartProvider Init: Parsed Roles from localStorage:", userRolesOnInit);
        } catch (e) {
          console.error("CartProvider Init: Erro ao decodificar token do localStorage", e);
          isTokenValid = false;
        }
      } else {
        console.log("CartProvider: Token expirado, limpando localStorage.");
      }
    }
    
    if (!isTokenValid) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUserId');
        localStorage.removeItem('authUserEmail');
        localStorage.removeItem('authUserFullName');
        localStorage.removeItem('authTokenExpiresOn');
    }

    if (isTokenValid && userId && userEmail && userFullName) {
      console.log("CartProvider: Usuário válido sendo restaurado do localStorage", { userId, userEmail, fullName: userFullName, roles: userRolesOnInit });
      setCurrentUser({
        id: userId,
        email: userEmail,
        fullName: userFullName,
        roles: userRolesOnInit
      });
      setAuthToken(storedToken);
    } else {
      console.log("CartProvider: Nenhum usuário válido no localStorage ou token expirado/inválido.");
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
        console.log("CartContext Login: Decoded Token Object:", decodedToken);
        // CORREÇÃO AQUI: Usar 'role' como nome da claim
        const roleClaim = decodedToken['role']; 
        console.log("CartContext Login: Extracted Role Claim:", roleClaim);
        if (roleClaim) {
          userRoles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        }
        console.log("CartContext Login: Parsed Roles:", userRoles);
      } catch (e) {
        console.error("CartContext Login: Erro ao decodificar token", e);
      }
    }

    setCurrentUser({
      id: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      roles: userRoles
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
    await fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    itemCount,
    loadingCart,
    cartError,
    refreshCart: fetchCart,

    currentUser,
    authToken,
    isAuthenticated: !!authToken,
    loginUser,
    logoutUser
  };

  // console.log('CartProvider providing value:', value);
  
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