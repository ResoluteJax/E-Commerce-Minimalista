// src/Application/Dtos/CreateProductDto.cs
using System.ComponentModel.DataAnnotations; // Adicionado

namespace MinimalistECommerce.Application.Dtos
{
    public class CreateProductDto
    {
        [Required(ErrorMessage = "O nome do produto é obrigatório.")] // Garante que não seja nulo ou vazio
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres.")] // Define tamanho min/max
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição não pode exceder 500 caracteres.")] // Apenas limite máximo
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "O preço é obrigatório.")]
        [Range(0.01, 999999.99, ErrorMessage = "O preço deve ser maior que zero e menor que 1 milhão.")] // Usando double para os limites
        [DataType(DataType.Currency)] // Ajuda na formatação/semântica
        public decimal Price { get; set; }

        // ImageUrl é opcional por enquanto, sem validação específica além de ser string
        public string ImageUrl { get; set; } = string.Empty;
    }
}