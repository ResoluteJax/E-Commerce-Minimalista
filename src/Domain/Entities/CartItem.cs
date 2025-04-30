// src/Domain/Entities/CartItem.cs
using System;

namespace MinimalistECommerce.Domain.Entities
{
    public class CartItem
    {
        public int Id { get; set; } // Chave Primária int
        public Guid CartId { get; set; } // Chave Estrangeira para Cart
        public int ProductId { get; set; } // Chave Estrangeira para Product
        public int Quantity { get; set; }

        // Propriedades de navegação para as entidades relacionadas
        // O '= null!;' suprime avisos de nulidade do C# 8+,
        // assumindo que o EF Core cuidará de preenchê-las quando necessário.
        public virtual Cart Cart { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}