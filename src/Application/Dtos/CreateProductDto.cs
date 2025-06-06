// src/Application/Dtos/CreateProductDto.cs
using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    public class CreateProductDto
    {
        [Required(ErrorMessage = "O nome do produto é obrigatório.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição não pode exceder 500 caracteres.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "O preço é obrigatório.")]
        [Range(0.01, 999999.99, ErrorMessage = "O preço deve ser maior que zero e menor que 1 milhão.")]
        [DataType(DataType.Currency)]
        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        // ADICIONE ESTA PROPRIEDADE:
        public int? CategoryId { get; set; } // Anulável, um produto pode ser criado sem categoria inicialmente
    }
}