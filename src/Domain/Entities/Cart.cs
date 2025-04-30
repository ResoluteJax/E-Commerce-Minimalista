// src/Domain/Entities/Cart.cs
using System;
using System.Collections.Generic;

namespace MinimalistECommerce.Domain.Entities
{
    public class Cart
    {
        public Guid Id { get; set; } // Chave Primária Guid
        public int? CustomerId { get; set; } // Chave Estrangeira anulável para Customer
        public DateTime CreatedAt { get; set; }
        public DateTime LastModifiedAt { get; set; }

        // Propriedade de navegação para os itens do carrinho
        // Inicializada para evitar referência nula
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

        // Construtor pode inicializar valores padrão
        public Cart()
        {
            Id = Guid.NewGuid(); // Gera um ID único ao criar
            CreatedAt = DateTime.UtcNow;
            LastModifiedAt = DateTime.UtcNow;
        }
         // Poderíamos adicionar aqui uma propriedade de navegação para Customer se necessário
         // public virtual Customer Customer { get; set; }
    }
}