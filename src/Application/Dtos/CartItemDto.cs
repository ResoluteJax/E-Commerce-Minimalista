// src/Application/Dtos/CartItemDto.cs
namespace MinimalistECommerce.Application.Dtos
{
    public class CartItemDto
    {
        public int Id { get; set; } // Id do próprio CartItem (útil p/ update/delete)
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty; // Nome do produto para exibição
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Preço unitário (do produto)
        public string ImageUrl { get; set; } = string.Empty; // Imagem do produto
        public decimal LineTotal => Quantity * UnitPrice; // Propriedade calculada
    }
}