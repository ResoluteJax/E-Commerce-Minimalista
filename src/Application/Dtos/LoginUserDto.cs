// src/Application/Dtos/LoginUserDto.cs
using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    public class LoginUserDto
    {
        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória.")]
        public string Password { get; set; } = string.Empty;
    }
}