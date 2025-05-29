// frontend/src/pages/admin/AdminCategoryForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Para authToken

function AdminCategoryForm({ mode = 'create' }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { authToken } = useCart();

  const [name, setName] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false); // Loading para dados iniciais (edição)
  const [isSubmitting, setIsSubmitting] = useState(false);  // Loading para o submit do formulário
  
  const [formErrors, setFormErrors] = useState({}); // Para erros de validação do formulário (por campo)
  const [apiResponse, setApiResponse] = useState({ message: null, type: '' }); // Para mensagens de sucesso/erro da API

  // Efeito para buscar dados da categoria para edição
  const fetchCategoryForEdit = useCallback(async () => {
    if (mode === 'edit' && categoryId && authToken) {
      setIsLoadingData(true);
      setApiResponse({ message: null, type: '' });
      setFormErrors({}); 
      const apiUrl = `http://localhost:5015/api/categories/${categoryId}`;
      try {
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          throw new Error(`Falha ao buscar categoria para edição: Status ${response.status}`);
        }
        const data = await response.json();
        setName(data.name || '');
      } catch (err) {
        console.error("Erro ao buscar categoria para edição:", err);
        setApiResponse({ message: err.message, type: 'error' });
      } finally {
        setIsLoadingData(false);
      }
    } else if (mode === 'create') {
      setName('');
      setFormErrors({});
      setApiResponse({ message: null, type: '' });
    }
  }, [mode, categoryId, authToken]);

  useEffect(() => {
    fetchCategoryForEdit();
  }, [fetchCategoryForEdit]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
        newErrors.name = "O nome da categoria é obrigatório.";
    } else if (name.trim().length < 2 || name.trim().length > 100) {
        newErrors.name = "O nome da categoria deve ter entre 2 e 100 caracteres.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse({ message: null, type: '' }); // Limpa API response anterior
    
    if (!validateForm()) { // Valida o formulário
      setIsSubmitting(false); // Garante que não fique em submitting se falhar na validação
      return;
    }

    setIsSubmitting(true);

    if (!authToken) {
      setApiResponse({ message: "Não autenticado para realizar esta ação.", type: 'error' });
      setIsSubmitting(false);
      return;
    }

    const payload = { name: name.trim() };
    const apiUrl = mode === 'create'
      ? 'http://localhost:5015/api/categories'
      : `http://localhost:5015/api/categories/${categoryId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = `Erro HTTP: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.errors && errorData.errors.Name) { // Específico para erros de validação do backend
                errorMsg = errorData.errors.Name.join(' ');
            } else {
                errorMsg = errorData.message || errorData.title || errorMsg;
            }
        } catch(jsonErr){
            errorMsg = await response.text() || errorMsg;
        }
        throw new Error(errorMsg);
      }

      if (mode === 'create') {
        const result = await response.json();
        setApiResponse({ message: `Categoria "${result.name}" criada com sucesso! ID: ${result.id}`, type: 'success' });
        setName(''); 
        setFormErrors({});
      } else {
        setApiResponse({ message: `Categoria "${payload.name}" atualizada com sucesso!`, type: 'success' });
        setFormErrors({});
      }
      // Opcional: navigate('/admin/categories');

    } catch (err) {
      console.error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} categoria:`, err);
      setApiResponse({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Estilos (podem ir para um arquivo CSS)
  const formStyle = { maxWidth: '500px', margin: '20px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: '500' };
  const inputStyle = { width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const errorTextStyle = { color: 'red', fontSize: '0.85em', marginTop: '0.25em' };
  const apiMessageStyle = (type) => ({
    padding: '10px',
    marginBottom: '1rem',
    border: `1px solid ${type === 'success' ? 'green' : 'red'}`,
    color: type === 'success' ? 'green' : 'red',
    backgroundColor: type === 'success' ? '#e6ffed' : '#ffe6e6',
    borderRadius: '4px'
  });
  const buttonStyle = { padding: '10px 15px', border: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' };
  const cancelButtonSyle = { padding: '10px 15px', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none' };

  if (isLoadingData && mode === 'edit') {
    return <p>Carregando dados da categoria para edição...</p>;
  }

  return (
    <div style={formStyle}>
      <h3>{mode === 'create' ? 'Adicionar Nova Categoria' : `Editar Categoria (ID: ${categoryId})`}</h3>
      <form onSubmit={handleSubmit}>
        {apiResponse.message && (
          <p style={apiMessageStyle(apiResponse.type)}>
            {apiResponse.message}
          </p>
        )}
        <div style={inputGroupStyle}>
          <label htmlFor="name" style={labelStyle}>Nome da Categoria:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
                setName(e.target.value);
                if(formErrors.name) setFormErrors(prev => ({...prev, name: null})); // Limpa erro ao digitar
            }}
            style={inputStyle}
          />
          {formErrors.name && <p style={errorTextStyle}>{formErrors.name}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting || isLoadingData} style={buttonStyle}>
          {isSubmitting ? 'Salvando...' : (mode === 'create' ? 'Adicionar Categoria' : 'Salvar Alterações')}
        </button>
        <Link to="/admin/categories" style={cancelButtonSyle}>Cancelar</Link>
      </form>
    </div>
  );
}

export default AdminCategoryForm;