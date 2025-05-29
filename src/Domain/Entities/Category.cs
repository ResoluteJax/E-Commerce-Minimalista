// src/Domain/Entities/Category.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Para os atributos de validação

namespace MinimalistECommerce.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome da categoria é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome da categoria não pode exceder 100 caracteres.")]
        public string Name { get; set; } = string.Empty;

        // Propriedade de navegação: uma categoria pode conter muitos produtos
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}