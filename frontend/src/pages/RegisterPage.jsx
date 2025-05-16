// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [defaultShippingAddress, setDefaultShippingAddress] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState({ message: null, isSuccess: false, errors: [] });

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "O nome completo é obrigatório.";
    if (!email.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Formato de e-mail inválido.";
    }
    if (!password) newErrors.password = "A senha é obrigatória.";
    else if (password.length < 6) newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    if (password !== confirmPassword) newErrors.confirmPassword = "As senhas não correspondem.";
    if (!defaultShippingAddress.trim()) newErrors.defaultShippingAddress = "O endereço de entrega é obrigatório.";

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiResponse({ message: null, isSuccess: false, errors: [] }); // Limpa resposta anterior da API
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    const registerData = { fullName, email, password, confirmPassword, defaultShippingAddress };
    const apiUrl = 'http://localhost:5015/api/account/register';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json(); // AuthResponseDto

      if (!response.ok || !data.isSuccess) {
        const errorMessages = data.errors && data.errors.length > 0 ? data.errors.join(', ') : (data.message || 'Falha no registro.');
        throw new Error(errorMessages);
      }

      setApiResponse({ message: data.message || "Registro bem-sucedido! Você será redirecionado para o login.", isSuccess: true, errors: [] });
      // Limpar formulário
      setFullName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setDefaultShippingAddress('');
      setFormErrors({});

      // Redirecionar para login após um breve delay para o usuário ler a mensagem
      setTimeout(() => {
        navigate('/login'); // Assumindo que teremos uma rota /login
      }, 2000);

    } catch (err) {
      console.error("Erro ao registrar:", err);
      setApiResponse({ message: err.message || "Ocorreu um erro durante o registro.", isSuccess: false, errors: [err.message] });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estilos (mesmos do CheckoutPage para consistência, pode refatorar para um CSS global depois)
  const formStyle = { maxWidth: '500px', margin: 'auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' };
  const inputGroupStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' };
  const inputStyle = { width: 'calc(100% - 12px)', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
  const errorStyle = { color: 'red', fontSize: '0.8em', marginTop: '0.2em' };
  const successStyle = { color: 'green', marginBottom: '1rem', border: '1px solid green', padding: '10px', borderRadius: '4px' };
  const buttonStyle = { padding: '0.75rem 1.5rem', border: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '100%' };


  return (
    <div style={formStyle}>
      <h2>Registrar Nova Conta</h2>
      <form onSubmit={handleSubmit}>
        {apiResponse.message && (
          <p style={apiResponse.isSuccess ? successStyle : errorStyle}>
            {apiResponse.message}
            {apiResponse.errors && apiResponse.errors.length > 0 && (
              <ul>{apiResponse.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}
          </p>
        )}

        <div style={inputGroupStyle}>
          <label htmlFor="fullName" style={labelStyle}>Nome Completo:</label>
          <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
          {formErrors.fullName && <p style={errorStyle}>{formErrors.fullName}</p>}
        </div>

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

        <div style={inputGroupStyle}>
          <label htmlFor="confirmPassword" style={labelStyle}>Confirmar Senha:</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
          {formErrors.confirmPassword && <p style={errorStyle}>{formErrors.confirmPassword}</p>}
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="defaultShippingAddress" style={labelStyle}>Endereço de Entrega Principal:</label>
          <textarea id="defaultShippingAddress" value={defaultShippingAddress} onChange={(e) => setDefaultShippingAddress(e.target.value)} rows={3} style={inputStyle} />
          {formErrors.defaultShippingAddress && <p style={errorStyle}>{formErrors.defaultShippingAddress}</p>}
        </div>

        <button type="submit" style={buttonStyle} disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Já tem uma conta? <Link to="/login">Faça Login</Link> {/* Link para futura página de login */}
      </p>
    </div>
  );
}

export default RegisterPage;