// src/Domain/Entities/Order.cs
using System;
using System.Collections.Generic;

namespace MinimalistECommerce.Domain.Entities
{
    public class Order
    {
        public int Id { get; set; } // PK
        public DateTime OrderDate { get; set; }
        public int? CustomerId { get; set; } // FK (anulável para permitir 'guest checkout' talvez?)
        public decimal TotalAmount { get; set; } // Calculado a partir dos OrderItems
        public string ShippingAddress { get; set; } = string.Empty; // Endereço de entrega do pedido
        public string Status { get; set; } = string.Empty; // Ex: "Pendente", "Processado", "Enviado"

        // Propriedades de Navegação
        public virtual Customer? Customer { get; set; } // Para qual cliente é o pedido
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>(); // Itens do pedido

        public Order()
        {
            OrderDate = DateTime.UtcNow; // Define data ao criar
            Status = "Pendente"; // Define status inicial
        }
    }
}