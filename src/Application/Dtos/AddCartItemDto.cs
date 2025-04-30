// src/Application/Dtos/AddCartItemDto.cs
using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    public class AddCartItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "A quantidade deve ser entre 1 e 100.")] // Exemplo de limite
        public int Quantity { get; set; }
    }
}