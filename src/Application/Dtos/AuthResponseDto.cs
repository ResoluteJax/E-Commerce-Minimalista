// src/Application/Dtos/AuthResponseDto.cs
using System;

namespace MinimalistECommerce.Application.Dtos
{
       public class AuthResponseDto
{
public bool IsSuccess { get; set; }
public string Message { get; set; } = string.Empty;
public string? Token { get; set; } // Será usado para o token JWT
public DateTime? ExpiresOn { get; set; } // Data de expiração do token

        // Informações do usuário (opcional, mas útil)
        public string? UserId { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }

        public IEnumerable<string>? Errors { get; set; } 
    }
}