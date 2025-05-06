// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; 
import { CartProvider } from './context/CartContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- Envolver App */}
    <CartProvider>
    <App />
    </CartProvider>
    </BrowserRouter> {/* <-- Fechar */}
  </React.StrictMode>,
)