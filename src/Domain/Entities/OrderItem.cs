// src/Domain/Entities/OrderItem.cs
using System;

namespace MinimalistECommerce.Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; } // PK
        public int OrderId { get; set; } // FK para Order
        public int ProductId { get; set; } // FK para Product
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Preço unitário NO MOMENTO DO PEDIDO

        // Propriedades de Navegação
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}