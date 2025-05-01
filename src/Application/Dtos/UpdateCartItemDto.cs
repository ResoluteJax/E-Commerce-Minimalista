using System.ComponentModel.DataAnnotations;

namespace MinimalistECommerce.Application.Dtos
{
    // DTO para receber a nova quantidade ao atualizar um item no carrinho
    public class UpdateCartItemDto
    {
        [Required(ErrorMessage = "A quantidade é obrigatória.")]
        [Range(1, 100, ErrorMessage = "A quantidade deve ser entre 1 e 100.")]
        public int Quantity { get; set; }
    }
}

