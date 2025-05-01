// src/Application/Dtos/CartDto.cs
using System;
using System.Collections.Generic;
using System.Linq; // Para usar Sum()

namespace MinimalistECommerce.Application.Dtos
{
    public class CartDto
    {
        public Guid Id { get; set; } // Id do Carrinho
        public int? CustomerId { get; set; } // Id do Cliente (se houver)
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>(); // Lista de itens no carrinho

        // Propriedade calculada para o total do carrinho
        public decimal TotalAmount => Items.Sum(item => item.LineTotal);

        // Propriedade calculada para a contagem total de itens (soma das quantidades)
        public int TotalItemCount => Items.Sum(item => item.Quantity);
    }
}