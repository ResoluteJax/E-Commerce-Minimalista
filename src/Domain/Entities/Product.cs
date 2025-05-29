// src/Domain/Entities/Product.cs
// using System.ComponentModel.DataAnnotations; // Adicione se não estiver
// using System.ComponentModel.DataAnnotations.Schema; // Adicione se for usar [ForeignKey]

namespace MinimalistECommerce.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        // Novas propriedades para Categoria
        public int? CategoryId { get; set; } // Chave Estrangeira (anulável se um produto pode não ter categoria)
        public virtual Category? Category { get; set; } // Propriedade de Navegação
    }
}