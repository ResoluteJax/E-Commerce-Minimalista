// src/Domain/Entities/Customer.cs
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace MinimalistECommerce.Domain.Entities
{
    public class Customer : IdentityUser // IdentityUser já fornece: Id (string), UserName, Email, PhoneNumber, etc.
    {
        // Propriedades personalizadas que queremos adicionar ao nosso usuário/cliente
        public string FullName { get; set; } = string.Empty;    // Nome completo para exibição, por exemplo
        public string DefaultShippingAddress { get; set; } = string.Empty; // Endereço de entrega padrão do cliente

        // Propriedade de navegação para os pedidos do cliente
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

        // Nota:
        // - O 'Id' (string) é herdado de IdentityUser.
        // - O 'Email' é herdado de IdentityUser.
        // - O 'UserName' é herdado de IdentityUser (geralmente configuramos para ser o mesmo que o Email).
        // - 'PhoneNumber' também é herdado, se precisar.
    }
}