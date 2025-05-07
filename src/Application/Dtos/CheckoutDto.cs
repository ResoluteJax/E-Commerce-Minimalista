// src/Application/Dtos/CheckoutDto.cs
using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    // DTO para receber os dados do formulário de checkout
    public class CheckoutDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        [StringLength(100, ErrorMessage = "O e-mail não pode exceder 100 caracteres.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "O endereço de entrega é obrigatório.")]
        [StringLength(250, ErrorMessage = "O endereço não pode exceder 250 caracteres.")]
        public string ShippingAddress { get; set; } = string.Empty;

        // Informações de pagamento simuladas não são necessárias aqui por enquanto.
        // O ID do carrinho será pego no backend (usando o Guid fixo).
    }
}