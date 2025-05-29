// frontend/src/pages/admin/AdminProductForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Para authToken

function AdminProductForm({ mode = 'create' }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { authToken } = useCart();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: ''
  });
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false); // Loading para dados iniciais (categorias e produto para edição)
  const [isSubmitting, setIsSubmitting] = useState(false);   // Loading para o submit do formulário
  
  const [formErrors, setFormErrors] = useState({}); // Para erros de validação do formulário (por campo)
  const [apiResponse, setApiResponse] = useState({ message: null, type: '' }); // Para mensagens de sucesso/erro da API

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      // setIsLoadingData(true); // Pode ser combinado com o fetch de produto
      try {
        const response = await fetch('http://localhost:5015/api/categories');
        if (!response.ok) throw new Error('Falha ao buscar categorias');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setApiResponse({ message: "Não foi possível carregar as categorias.", type: 'error' });
      }
      // setIsLoadingData(false);
    };
    fetchCategories();
  }, []);

  // Buscar dados do produto para edição
  const fetchProductForEdit = useCallback(async () => {
    if (mode === 'edit' && productId && authToken) {
      console.log(`Modo Edição: Buscando produto ID ${productId}`);
      setIsLoadingData(true);
      setApiResponse({ message: null, type: '' }); // Limpa mensagens anteriores
      setFormErrors({}); // Limpa erros de formulário anteriores

      const apiUrl = `http://localhost:5015/api/products/${productId}`;
      try {
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          throw new Error(`Falha ao buscar produto para edição: Status ${response.status}`);
        }
        const data = await response.json();
        setProductData({
          name: data.name || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          imageUrl: data.imageUrl || '',
          categoryId: data.categoryId?.toString() || ''
        });
      } catch (err) {
        console.error("Erro ao buscar produto para edição:", err);
        setApiResponse({ message: err.message, type: 'error' });
      } finally {
        setIsLoadingData(false);
      }
    } else if (mode === 'create') {
      setProductData({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
      setFormErrors({});
      setApiResponse({ message: null, type: '' });
    }
  }, [mode, productId, authToken]);

  useEffect(() => {
    fetchProductForEdit();
  }, [fetchProductForEdit]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Opcional: Limpar erro do campo ao digitar
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  // Função de validação robusta
  const validateForm = () => {
    const newErrors = {};
    if (!productData.name.trim()) {
        newErrors.name = "O nome do produto é obrigatório.";
    } else if (productData.name.trim().length < 3 || productData.name.trim().length > 100) {
        newErrors.name = "O nome deve ter entre 3 e 100 caracteres.";
    }

    if (productData.description && productData.description.length > 500) {
        newErrors.description = "A descrição não pode exceder 500 caracteres.";
    }

    if (!productData.price.toString().trim()) {
        newErrors.price = "O preço é obrigatório.";
    } else {
        const priceValue = parseFloat(productData.price);
        if (isNaN(priceValue)) {
            newErrors.price = "Preço deve ser um número válido.";
        } else if (priceValue < 0.01 || priceValue > 999999.99) {
            newErrors.price = "O preço deve ser entre R$0.01 e R$999.999,99.";
        }
    }
    
    if (productData.categoryId && isNaN(parseInt(productData.categoryId, 10))) {
        newErrors.categoryId = "Seleção de categoria inválida.";
    }

    if (productData.imageUrl && !/^https?:\/\/.+\..+/.test(productData.imageUrl) && productData.imageUrl.trim() !== '') {
        newErrors.imageUrl = "Formato de URL da imagem inválido (ex: http://site.com/imagem.jpg).";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse({ message: null, type: '' }); // Limpa mensagens da API

    if (!validateForm()) { // Valida antes de submeter
      return;
    }

    setIsSubmitting(true);

    if (!authToken) {
      setApiResponse({ message: "Não autenticado para realizar esta ação.", type: 'error' });
      setIsSubmitting(false);
      return;
    }

    const priceValue = parseFloat(productData.price);

    const payload = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: priceValue,
      imageUrl: productData.imageUrl.trim(),
      categoryId: productData.categoryId ? parseInt(productData.categoryId, 10) : null
    };

    const apiUrl = mode === 'create'
      ? 'http://localhost:5015/api/products'
      : `http://localhost:5015/api/products/${productId}`;
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
            // Para erros de validação do backend (ProblemDetails)
            if (errorData.errors) {
                errorMsg = Object.entries(errorData.errors)
                                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                                .join('; ');
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
        setApiResponse({ message: `Produto "${result.name}" criado com sucesso! ID: ${result.id}`, type: 'success' });
        setProductData({ name: '', description: '', price: '', imageUrl: '', categoryId: '' }); // Limpa form
        setFormErrors({}); // Limpa erros de validação do form
      } else { // modo 'edit'
        setApiResponse({ message: `Produto "${payload.name}" atualizado com sucesso!`, type: 'success' });
        setFormErrors({});
      }
      // Considerar redirecionar após um tempo ou após clique em mensagem de sucesso
      // setTimeout(() => navigate('/admin/products'), 2000);

    } catch (err) {
      console.error(`Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} produto:`, err);
      setApiResponse({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estilos (podem ir para um arquivo CSS)
  const formStyle = { maxWidth: '600px', margin: '20px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' };
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
      return <p>Carregando dados do produto para edição...</p>;
  }

  return (
    <div style={formStyle}>
      <h3>{mode === 'create' ? 'Adicionar Novo Produto' : `Editar Produto (ID: ${productId})`}</h3>
      <form onSubmit={handleSubmit}>
        {apiResponse.message && (
          <p style={apiMessageStyle(apiResponse.type)}>
            {apiResponse.message}
          </p>
        )}

        <div style={inputGroupStyle}>
          <label htmlFor="name" style={labelStyle}>Nome do Produto:</label>
          <input type="text" id="name" name="name" value={productData.name} onChange={handleChange} style={inputStyle}/>
          {formErrors.name && <p style={errorTextStyle}>{formErrors.name}</p>}
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="description" style={labelStyle}>Descrição:</label>
          <textarea id="description" name="description" value={productData.description} onChange={handleChange} rows="4" style={inputStyle}/>
          {formErrors.description && <p style={errorTextStyle}>{formErrors.description}</p>}
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="price" style={labelStyle}>Preço (R$):</label>
          <input type="number" id="price" name="price" value={productData.price} onChange={handleChange} step="0.01" style={inputStyle}/>
          {formErrors.price && <p style={errorTextStyle}>{formErrors.price}</p>}
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="imageUrl" style={labelStyle}>URL da Imagem:</label>
          <input type="text" id="imageUrl" name="imageUrl" value={productData.imageUrl} onChange={handleChange} style={inputStyle}/>
          {formErrors.imageUrl && <p style={errorTextStyle}>{formErrors.imageUrl}</p>}
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="categoryId" style={labelStyle}>Categoria:</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            value={productData.categoryId} 
            onChange={handleChange} 
            style={inputStyle}
          >
            <option value="">Selecione uma categoria (Opcional)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
            ))}
          </select>
          {formErrors.categoryId && <p style={errorTextStyle}>{formErrors.categoryId}</p>}
        </div>

        <button type="submit" disabled={isSubmitting || isLoadingData} style={buttonStyle}>
          {isSubmitting ? 'Salvando...' : (mode === 'create' ? 'Adicionar Produto' : 'Salvar Alterações')}
        </button>
        <Link to="/admin/products" style={cancelButtonSyle}>Cancelar</Link>
      </form>
    </div>
  );
}

export default AdminProductForm;