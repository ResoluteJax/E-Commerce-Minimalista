// src/Domain/Entities/Customer.cs
using System.Collections.Generic; // Para ICollection

namespace MinimalistECommerce.Domain.Entities
{
    public class Customer
    {
        public int Id { get; set; } // PK
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; // Idealmente, adicionar validação/índice único depois
        public string Address { get; set; } = string.Empty; // Endereço principal

        // Propriedade de navegação para os pedidos do cliente
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}