// src/Application/Dtos/OrderDto.cs
using System;
using System.Collections.Generic;

namespace MinimalistECommerce.Application.Dtos
{
    // DTO para representar os dados de um pedido criado retornado pela API
    public class OrderDto
    {
        public int Id { get; set; } // O ID do pedido gerado
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string? CustomerId { get; set; } // ID do cliente associado (se houver)
        public string ShippingAddress { get; set; } = string.Empty;

        // Reutilizamos o CartItemDto para representar os itens do pedido na resposta
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    }
}