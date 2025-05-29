// src/Application/Dtos/UpdateOrderStatusDto.cs
using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    public class UpdateOrderStatusDto
    {
        [Required(ErrorMessage = "O novo status é obrigatório.")]
        [StringLength(50, ErrorMessage = "O status não pode exceder 50 caracteres.")]
        public string NewStatus { get; set; } = string.Empty;
    }
}