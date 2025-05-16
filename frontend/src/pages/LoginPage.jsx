// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Para atualizar o carrinho após login

 function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState({ message: null, isSuccess: false, errors: [] });

  const navigate = useNavigate();
  const { refreshCart } = useCart(); // Para atualizar o estado do carrinho no contexto

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Formato de e-mail inválido.";
    }
    if (!password) newErrors.password = "A senha é obrigatória.";
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiResponse({ message: null, isSuccess: false, errors: [] }); // Limpa resposta anterior
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    const loginData = { email, password };
    const apiUrl = 'http://localhost:5015/api/account/login';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json(); // AuthResponseDto

      if (!response.ok || !data.isSuccess) {
        const errorMessages = data.errors && data.errors.length > 0 ? data.errors.join(', ') : (data.message || 'Falha no login.');
        throw new Error(errorMessages);
      }
      
      setApiResponse({ message: data.message || "Login bem-sucedido!", isSuccess: true, errors: [] });
      
      // TODO Tarefa 5: Guardar o token (data.token) no frontend
      console.log("Login bem-sucedido, Token:", data.token); // Log temporário do token
      
      await refreshCart(); // Atualiza o carrinho após login

      // Redirecionar para a página inicial ou dashboard após login
      setTimeout(() => {
        navigate('/'); 
      }, 1500); // Delay para mostrar a mensagem de sucesso

    } catch (err) {
      console.error("Erro ao logar:", err);
      setApiResponse({ message: err.message || "Ocorreu um erro durante o login.", isSuccess: false, errors: [err.message] });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estilos (reutilizar os estilos do RegisterPage/CheckoutPage ou centralizar depois)
  const formStyle = { maxWidth: '400px', margin: 'auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' };
  const inputGroupStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' };
  const inputStyle = { width: 'calc(100% - 12px)', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
  const errorStyle = { color: 'red', fontSize: '0.8em', marginTop: '0.2em' };
  const successStyle = { color: 'green', marginBottom: '1rem', border: '1px solid green', padding: '10px', borderRadius: '4px' };
  const buttonStyle = { padding: '0.75rem 1.5rem', border: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '100%' };

  return (
    <div style={formStyle}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {apiResponse.message && (
          <p style={apiResponse.isSuccess ? successStyle : errorStyle}>
            {apiResponse.message}
          </p>
        )}

        <div style={inputGroupStyle}>
          <label htmlFor="email" style={labelStyle}>E-mail:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          {formErrors.email && <p style={errorStyle}>{formErrors.email}</p>}
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="password" style={labelStyle}>Senha:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {formErrors.password && <p style={errorStyle}>{formErrors.password}</p>}
        </div>

        <button type="submit" style={buttonStyle} disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Não tem uma conta? <Link to="/register">Registre-se</Link>
      </p>
    </div>
  );
}

export default LoginPage;