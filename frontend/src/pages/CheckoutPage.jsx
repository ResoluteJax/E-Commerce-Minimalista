// frontend/src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importaremos depois para redirecionar
import { useCart } from '../context/CartContext';

function CheckoutPage() {
  // Estados para controlar os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Para desabilitar botão
  const [error, setError] = useState(null); // Para erros da API
  const { refreshCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('Boleto');
  // const navigate = useNavigate();


  // inicio handleSubmit \\
const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null); // Limpa erros anteriores
    

    const checkoutData = { name, email, shippingAddress: address };
    const apiUrl = 'http://localhost:5015/api/orders'; // Endpoint POST para criar pedido

    console.log('Enviando dados do Checkout:', checkoutData, ' Pagamento:', paymentMethod);
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
            // Tenta ler a resposta de erro da API
            let errorMsg = `Erro HTTP: ${response.status}`;
            try {
                const errorData = await response.json(); // Tenta como JSON (ex: erro de validação)
                // A API pode retornar ProblemDetails com erros de validação
                if (errorData && errorData.errors) {
                   errorMsg = Object.values(errorData.errors).flat().join('\n');
                } else if (errorData && errorData.message) {
                   errorMsg = errorData.message;
                } else {
                   errorMsg = await response.text(); // Ou pega como texto simples
                }
            } catch(e) {
                errorMsg = await response.text(); // Fallback para texto
            }
             throw new Error(errorMsg || "Falha ao criar pedido.");
        }

        const orderResult = await response.json(); // Pega o OrderDto retornado
        console.log('Pedido criado com sucesso:', orderResult);
        alert(`Pedido #${orderResult.id} realizado com sucesso!`);

        // Atualiza o estado do carrinho (deve ficar vazio ou dar 404 agora)
        // Assumindo que o backend NÃO limpou o carrinho ainda.
        await refreshCart();

        // TODO Tarefa 5: Redirecionar para página de confirmação
        // navigate(`/order-confirmation/${orderResult.id}`);

        // Limpa o formulário (opcional)
        // setName(''); setEmail(''); setAddress('');

    } catch (err) {
        console.error("Erro ao finalizar pedido:", err);
        setError(err.message || "Falha ao criar pedido.");
    } finally {
        setIsSubmitting(false); // Reabilita o botão
    }
};
// fim handleSubmit \\


































  // Estilos simples (podem ir para um arquivo CSS)
  const formStyle = { maxWidth: '500px', margin: 'auto' };
  const inputGroupStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', marginBottom: '0.25rem' };
  const inputStyle = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' };
  const buttonStyle = { padding: '0.75rem 1.5rem', border: 'none', backgroundColor: 'green', color: 'white', borderRadius: '4px', cursor: 'pointer' };

  return (
    <div style={formStyle}>
      <h2>Finalizar Compra</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="name" style={labelStyle}>Nome Completo:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
            maxLength={100}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="email" style={labelStyle}>E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            maxLength={100}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="address" style={labelStyle}>Endereço de Entrega Completo:</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={4}
            style={inputStyle}
            maxLength={250}
          />
        </div>

        {/* --- Início Seleção de Pagamento Simulado --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Forma de Pagamento (Simulada):</label>
          <div>
            <input
              type="radio"
              id="paymentBoleto"
              name="paymentMethod"
              value="Boleto"
              checked={paymentMethod === 'Boleto'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="paymentBoleto" style={{ marginRight: '15px' }}>Boleto Simulado</label>

            <input
              type="radio"
              id="paymentCartao"
              name="paymentMethod"
              value="Cartao"
              checked={paymentMethod === 'Cartao'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            <label htmlFor="paymentCartao">Cartão Simulado</label>
          </div>
        </div>
        {/* --- Fim Seleção de Pagamento Simulado --- */}


        {/* Exibe erro da API, se houver */}
        {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

        <button type="submit" style={buttonStyle} disabled={isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;