// src/Application/Dtos/CreateCategoryDto.cs
using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "O nome da categoria é obrigatório.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "O nome da categoria deve ter entre 2 e 100 caracteres.")]
        public string Name { get; set; } = string.Empty;
    }
}